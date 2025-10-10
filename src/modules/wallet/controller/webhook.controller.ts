// @/modules/wallet/controllers/webhook.controller.ts
import { Request, Response } from 'express';
import crypto from 'crypto';
import { AppError, AppResponse } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { withdrawalRequestRepository } from '../repository';
import { ENVIRONMENT } from '@/common/config';

/**
 * Base structure of Paystack webhook payloads
 */
interface PaystackWebhookPayload<T> {
	event: string;
	data: T;
}

/**
 * Relevant Paystack data types for transfers
 */
interface PaystackTransferData {
	reference: string;
	transfer_code: string;
	amount: number;
	message?: string;
	recipient?: {
		active: boolean;
		name: string;
		domain: string;
		details: {
			account_number: string;
			bank_code: string;
			bank_name: string;
		};
	};
}

/**
 * Controller for handling Paystack webhooks
 */
export class PaystackWebhookController {
	/**
	 * Verify Paystack webhook signature
	 */
	private verifySignature(req: Request): boolean {
		const secret = ENVIRONMENT.PAYSTACK.SECRET_KEY || '';
		const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
		const signature = req.headers['x-paystack-signature'];
		return hash === signature;
	}

	/**
	 * Main webhook handler for Paystack
	 */
	handleWebhook = catchAsync(async (req: Request, res: Response) => {
		if (!this.verifySignature(req)) {
			console.error('❌ Invalid Paystack webhook signature');
			throw new AppError('Invalid signature', 401);
		}

		const body = req.body as PaystackWebhookPayload<unknown>;
		console.log('📥 Paystack webhook received:', body.event);

		switch (body.event) {
			case 'transfer.success':
				if (this.isTransferData(body.data)) {
					await this.handleTransferSuccess(body.data);
				}
				break;

			case 'transfer.failed':
				if (this.isTransferData(body.data)) {
					await this.handleTransferFailed(body.data);
				}
				break;

			case 'transfer.reversed':
				if (this.isTransferData(body.data)) {
					await this.handleTransferReversed(body.data);
				}
				break;

			default:
				console.log('ℹ️ Unhandled webhook event:', body.event);
		}

		return AppResponse(res, 200, null, 'Webhook processed');
	});

	/**
	 * Type guard for transfer events
	 */
	private isTransferData(data: unknown): data is PaystackTransferData {
		return typeof data === 'object' && data !== null && 'reference' in data && 'transfer_code' in data;
	}

	/**
	 * Handle successful transfer
	 */
	private async handleTransferSuccess(data: PaystackTransferData): Promise<void> {
		const { reference, transfer_code, amount } = data;
		console.log('✅ Transfer success:', { reference, transfer_code, amount });

		try {
			const withdrawal = await withdrawalRequestRepository.findByReference(reference);
			if (!withdrawal) {
				console.error('❌ Withdrawal not found for reference:', reference);
				return;
			}

			if (withdrawal.status === 'completed') {
				console.log('ℹ️ Withdrawal already completed:', withdrawal.id);
				return;
			}

			await withdrawalRequestRepository.completeWithdrawal(withdrawal.id);
			console.log('✅ Withdrawal completed successfully:', withdrawal.id);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Unknown error';
			console.error('❌ Error handling transfer success:', message);
		}
	}

	/**
	 * Handle failed transfer
	 */
	private async handleTransferFailed(data: PaystackTransferData): Promise<void> {
		const { reference, transfer_code, message } = data;
		console.log('❌ Transfer failed:', { reference, transfer_code, message });

		try {
			const withdrawal = await withdrawalRequestRepository.findByReference(reference);
			if (!withdrawal) {
				console.error('❌ Withdrawal not found for reference:', reference);
				return;
			}

			if (withdrawal.status === 'failed') {
				console.log('ℹ️ Withdrawal already marked as failed:', withdrawal.id);
				return;
			}

			const reason = message || 'Transfer failed on Paystack';
			await withdrawalRequestRepository.failWithdrawal(withdrawal.id, reason);
			console.log('❌ Withdrawal failed and balance refunded:', withdrawal.id);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Unknown error';
			console.error('❌ Error handling transfer failure:', message);
		}
	}

	/**
	 * Handle reversed transfer
	 */
	private async handleTransferReversed(data: PaystackTransferData): Promise<void> {
		const { reference, transfer_code } = data;
		console.log('🔄 Transfer reversed:', { reference, transfer_code });

		try {
			const withdrawal = await withdrawalRequestRepository.findByReference(reference);
			if (!withdrawal) {
				console.error('❌ Withdrawal not found for reference:', reference);
				return;
			}

			const reason = 'Transfer was reversed by Paystack';
			await withdrawalRequestRepository.failWithdrawal(withdrawal.id, reason);
			console.log('🔄 Withdrawal reversed and balance refunded:', withdrawal.id);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Unknown error';
			console.error('❌ Error handling transfer reversal:', message);
		}
	}

	/**
	 * Handle successful contribution payment
	 * This credits the wishlist owner's wallet
	 */
	// private async handleChargeSuccess(data: any): Promise<void> {
	// 	const { reference, amount, customer, metadata } = data;

	// 	// Amount is in kobo, convert to naira
	// 	const amountInNaira = amount / 100;

	// 	console.log('💰 Payment received:', {
	// 		reference,
	// 		amount: amountInNaira,
	// 		customer: customer.email,
	// 	});

	// 	try {
	// 		// Import contribution repository
	// 		const { contributionRepository } = require('@/modules/contribution/repository');
	// 		const { contributionService } = require('@/modules/contribution/services');

	// 		// Find contribution by reference
	// 		const contribution = await contributionRepository.findByReference(reference);

	// 		if (!contribution) {
	// 			console.error('❌ Contribution not found for reference:', reference);
	// 			return;
	// 		}

	// 		if (contribution.status === 'completed') {
	// 			console.log('ℹ️ Contribution already processed:', contribution.id);
	// 			return;
	// 		}

	// 		// Process the contribution and credit wallet
	// 		await contributionService.handleSuccessfulPayment(contribution.id, reference);
	// 		console.log('✅ Contribution processed and wallet credited:', contribution.id);
	// 	} catch (error: any) {
	// 		console.error('❌ Error handling charge success:', error.message);
	// 	}
	// }

	/**
	 * Test webhook endpoint (for dev/testing)
	 */
	testWebhook = catchAsync(async (req: Request, res: Response) => {
		const body = req.body as PaystackWebhookPayload<unknown>;
		console.log('🧪 Test webhook called:', body.event);

		if (ENVIRONMENT.APP.ENV === 'development') {
			if (body.event === 'transfer.success' && this.isTransferData(body.data)) {
				await this.handleTransferSuccess(body.data);
			} else if (body.event === 'transfer.failed' && this.isTransferData(body.data)) {
				await this.handleTransferFailed(body.data);
			}
		}

		return AppResponse(res, 200, null, 'Test webhook processed');
	});
}

export const paystackWebhookController = new PaystackWebhookController();
