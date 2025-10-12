import { Request, Response } from 'express';
import crypto from 'crypto';
import { AppResponse } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { withdrawalRequestRepository } from '../repository';
import { ENVIRONMENT } from '@/common/config';
import { PaystackChargeData, PaystackTransferData, PaystackWebhookPayload } from '@/common/interfaces';
import { contributionRepository } from '@/modules/wishlist/repository';

export class PaystackWebhookController {
	private verifySignature(req: Request): boolean {
		const secret = ENVIRONMENT.PAYSTACK.SECRET_KEY || '';
		const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
		const signature = req.headers['x-paystack-signature'];
		return hash === signature;
	}

	handleWebhook = catchAsync(async (req: Request, res: Response) => {
		// if (!this.verifySignature(req)) {
		// 	console.error('❌ Invalid Paystack webhook signature');
		// 	throw new AppError('Invalid signature', 401);
		// }

		const body = req.body as PaystackWebhookPayload<unknown>;
		console.log('📥 Paystack webhook received:', body.event);

		switch (body.event) {
			case 'charge.success':
				if (this.isChargeData(body.data)) {
					await this.handleChargeSuccess(body.data);
				}
				break;

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

	private isTransferData(data: unknown): data is PaystackTransferData {
		return typeof data === 'object' && data !== null && 'reference' in data && 'transfer_code' in data;
	}

	private isChargeData(data: unknown): data is PaystackChargeData {
		return typeof data === 'object' && data !== null && 'reference' in data && 'customer' in data;
	}

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

	// ==================== CONTRIBUTION PAYMENT HANDLERS ====================

	private async handleChargeSuccess(data: PaystackChargeData): Promise<void> {
		const { reference, amount, customer } = data;

		// Amount is in kobo, convert to naira
		const amountInNaira = amount / 100;

		console.log('💰 Payment received:', {
			reference,
			amount: amountInNaira,
			customer: customer.email,
		});

		try {
			// Check if it's a contribution
			const contribution = await contributionRepository.findByReference(reference);

			if (contribution) {
				console.log('🎁 Processing contribution payment:', contribution.id);

				if (contribution.status === 'completed') {
					console.log('ℹ️ Contribution already processed:', contribution.id);
					return;
				}

				// Process the contribution and credit wallet
				await contributionRepository.handleSuccessfulPayment(contribution.id, reference);
				console.log('✅ Contribution processed and wallet credited:', contribution.id);
			} else {
				console.log('ℹ️ No contribution found for reference:', reference);
				// Could be other payment types in the future
			}
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Unknown error';
			console.error('❌ Error handling transfer reversal:', message);
		}
	}

	testWebhook = catchAsync(async (req: Request, res: Response) => {
		const body = req.body as PaystackWebhookPayload<unknown>;
		console.log('🧪 Test webhook called:', body.event);

		if (ENVIRONMENT.APP.ENV === 'development') {
			if (body.event === 'charge.success' && this.isChargeData(body.data)) {
				await this.handleChargeSuccess(body.data);
			} else if (body.event === 'transfer.success' && this.isTransferData(body.data)) {
				await this.handleTransferSuccess(body.data);
			} else if (body.event === 'transfer.failed' && this.isTransferData(body.data)) {
				await this.handleTransferFailed(body.data);
			}
		}

		return AppResponse(res, 200, null, 'Test webhook processed');
	});
}

export const paystackWebhookController = new PaystackWebhookController();
