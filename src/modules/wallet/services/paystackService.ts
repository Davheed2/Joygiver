import axios from 'axios';
import type { AxiosError, AxiosResponse } from 'axios';

import { AppError } from '@/common/utils';
import {
	IPaystackBank,
	IPaystackAccountVerification,
	IPaystackTransferRecipient,
	IPaystackTransfer,
    IPaystackVerifyTransfer,
    PaystackResponse,
} from '@/common/interfaces';
import { ENVIRONMENT } from '@/common/config';



class PaystackService {
	private readonly baseUrl = 'https://api.paystack.co';
	private readonly secretKey: string;

	constructor() {
		this.secretKey = ENVIRONMENT.PAYSTACK.SECRET_KEY || '';
		if (!this.secretKey) {
			throw new Error('PAYSTACK_SECRET_KEY is not defined in environment variables');
		}
	}

	private getHeaders() {
		return {
			Authorization: `Bearer ${this.secretKey}`,
			'Content-Type': 'application/json',
		};
	}

	// Get list of Nigerian banks
	async getBanks(search?: string): Promise<IPaystackBank[]> {
		try {
			const response: AxiosResponse<PaystackResponse<IPaystackBank[]>> = await axios.get(
				`${this.baseUrl}/bank?currency=NGN`,
				{ headers: this.getHeaders() }
			);

			if (!response.data.status) {
				throw new AppError('Failed to fetch banks from Paystack', 500);
			}

			let banks = response.data.data;
			if (search) {
				const query = search.toLowerCase();
				banks = banks.filter((b) => b.name.toLowerCase().includes(query) || b.code.toLowerCase().includes(query));
			}

			return banks;
		} catch (err: unknown) {
			this.handleAxiosError(err, 'Failed to fetch banks');
		}
	}

	// Verify account number with bank
	async verifyAccountNumber(accountNumber: string, bankCode: string): Promise<IPaystackAccountVerification> {
		try {
			const response: AxiosResponse<PaystackResponse<IPaystackAccountVerification>> = await axios.get(
				`${this.baseUrl}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
				{ headers: this.getHeaders() }
			);

			if (!response.data.status) {
				throw new AppError('Account verification failed', 400);
			}

			return response.data.data;
		} catch (err: unknown) {
			const error = err as AxiosError<{ message?: string }>;
			if (error.response?.status === 422) {
				throw new AppError('Invalid account number or bank code', 400);
			}
			this.handleAxiosError(err, 'Account verification failed');
		}
	}

	// Create transfer recipient
	async createTransferRecipient(
		accountNumber: string,
		accountName: string,
		bankCode: string
	): Promise<IPaystackTransferRecipient> {
		try {
			const response: AxiosResponse<PaystackResponse<IPaystackTransferRecipient>> = await axios.post(
				`${this.baseUrl}/transferrecipient`,
				{
					type: 'nuban',
					name: accountName,
					account_number: accountNumber,
					bank_code: bankCode,
					currency: 'NGN',
				},
				{ headers: this.getHeaders() }
			);

			if (!response.data.status) {
				throw new AppError('Failed to create transfer recipient', 500);
			}

			return response.data.data;
		} catch (err: unknown) {
			this.handleAxiosError(err, 'Failed to create transfer recipient');
		}
	}

	// Initiate transfer
	async initiateTransfer(
		recipientCode: string,
		amount: number,
		reference: string,
		reason?: string
	): Promise<IPaystackTransfer> {
		try {
			const amountInKobo = Math.round(amount * 100);

			const response: AxiosResponse<PaystackResponse<IPaystackTransfer>> = await axios.post(
				`${this.baseUrl}/transfer`,
				{
					source: 'balance',
					reason: reason || 'Withdrawal from Joygiver wallet',
					amount: amountInKobo,
					recipient: recipientCode,
					reference,
				},
				{ headers: this.getHeaders() }
			);

			if (!response.data.status) {
				throw new AppError('Failed to initiate transfer', 500);
			}

			return response.data.data;
		} catch (err: unknown) {
			this.handleAxiosError(err, 'Failed to initiate transfer');
			throw err; // always rethrow to preserve stack trace
		}
	}

	// Verify transfer status
	async verifyTransfer(transferCode: string) {
		try {
			const response: AxiosResponse<PaystackResponse<unknown>> = await axios.get(
				`${this.baseUrl}/transfer/${transferCode}`,
				{ headers: this.getHeaders() }
			);

			if (!response.data.status) {
				throw new AppError('Failed to verify transfer', 500);
			}

			return response.data.data  as IPaystackVerifyTransfer;
		} catch (err: unknown) {
			this.handleAxiosError(err, 'Failed to verify transfer');
		}
	}

	// Calculate withdrawal fee
	calculateWithdrawalFee(amount: number): number {
		const baseFee = 10;
		const percentageFee = amount * 0.005;
		const totalFee = Math.min(baseFee + percentageFee, 50);
		return Math.round(totalFee * 100) / 100;
	}

	// Get Paystack balance
	async getBalance() {
		try {
			const response: AxiosResponse<PaystackResponse<unknown>> = await axios.get(`${this.baseUrl}/balance`, {
				headers: this.getHeaders(),
			});

			if (!response.data.status) {
				throw new AppError('Failed to fetch balance', 500);
			}

			return response.data.data;
		} catch (err: unknown) {
			this.handleAxiosError(err, 'Failed to fetch balance');
		}
	}

	// List transfer recipients
	async listTransferRecipients(page = 1, perPage = 50) {
		try {
			const response: AxiosResponse<PaystackResponse<unknown>> = await axios.get(
				`${this.baseUrl}/transferrecipient?perPage=${perPage}&page=${page}`,
				{ headers: this.getHeaders() }
			);

			if (!response.data.status) {
				throw new AppError('Failed to list transfer recipients', 500);
			}

			return response.data.data;
		} catch (err: unknown) {
			this.handleAxiosError(err, 'Failed to list transfer recipients');
		}
	}

	// Delete transfer recipient
	async deleteTransferRecipient(recipientCode: string) {
		try {
			const response: AxiosResponse<PaystackResponse<unknown>> = await axios.delete(
				`${this.baseUrl}/transferrecipient/${recipientCode}`,
				{ headers: this.getHeaders() }
			);

			if (!response.data.status) {
				throw new AppError('Failed to delete transfer recipient', 500);
			}

			return response.data.data;
		} catch (err: unknown) {
			this.handleAxiosError(err, 'Failed to delete transfer recipient');
		}
	}

	// Centralized type-safe error handler
	private handleAxiosError(err: unknown, fallbackMessage: string): never {
		if (axios.isAxiosError(err)) {
			const axiosError = err as AxiosError<{ message?: string }>;
			const message = axiosError.response?.data?.message || fallbackMessage;
			console.error('Paystack API Error:', axiosError.response?.data || axiosError.message);
			throw new AppError(message, axiosError.response?.status || 500);
		} else if (err instanceof Error) {
			console.error('Unexpected Error:', err.message);
			throw new AppError(err.message || fallbackMessage, 500);
		} else {
			console.error('Unknown error:', err);
			throw new AppError(fallbackMessage, 500);
		}
	}
}

export const paystackService = new PaystackService();
