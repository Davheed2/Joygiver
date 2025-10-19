import axios, { AxiosError } from 'axios';
import {
	ITermiiSendSmsPayload,
	ITermiiSendSmsResponse,
	ITermiiErrorResponse,
	ISendSmsOptions,
	ISendOtpOptions,
	ISmsResult,
} from '@/common/interfaces';
import { AppError } from '@/common/utils';
import { ENVIRONMENT } from '@/common/config';

class SmsService {
	private readonly apiKey: string;
	private readonly senderId: string;
	private readonly baseUrl: string = 'https://api.ng.termii.com/api'; 
    // Termii base URL
    // https://v3.api.termii.com

	constructor() {
		this.apiKey = ENVIRONMENT.TERMII.API_KEY || '';
		this.senderId = ENVIRONMENT.TERMII.SENDER_ID || '';

		if (!this.apiKey) {
			console.error('TERMII_API_KEY is not set in environment variables');
		}

		if (!this.senderId) {
			console.error('TERMII_SENDER_ID is not set in environment variables');
		}
	}

	/**
	 * Send SMS via Termii
	 */
	async sendSms(options: ISendSmsOptions): Promise<ISmsResult> {
		try {
			if (!this.apiKey || !this.senderId) {
				throw new AppError('SMS service not properly configured', 500);
			}

			// Format phone number (remove + if present)
			const formattedPhone = options.phone.replace(/^\+/, '');

			const payload: ITermiiSendSmsPayload = {
				to: formattedPhone,
				from: this.senderId,
				sms: options.message,
				type: options.type || 'plain',
				channel: options.channel || 'generic',
				api_key: this.apiKey,
			};

			const response = await axios.post<ITermiiSendSmsResponse>(`${this.baseUrl}/sms/send`, payload, {
				headers: {
					'Content-Type': 'application/json',
				},
				timeout: 10000, // 10 seconds timeout
			});

			console.log('SMS sent successfully:', {
				messageId: response.data.message_id,
				phone: formattedPhone,
				balance: response.data.balance,
			});

			return {
				success: true,
				messageId: response.data.message_id,
				message: response.data.message,
				balance: response.data.balance,
			};
		} catch (error) {
			return this.handleError(error, options.phone);
		}
	}

	/**
	 * Send OTP SMS
	 */
	async sendOtpSms(options: ISendOtpOptions): Promise<ISmsResult> {
		const message = `Your OTP is: ${options.otp}. Valid for 5 minutes. Do not share this code with anyone.`;

		return await this.sendSms({
			phone: options.phone,
			message,
			channel: options.channel || 'dnd', // Use 'dnd' channel for OTP
			type: 'plain',
		});
	}

	/**
	 * Send OTP SMS with custom template
	 */
	async sendOtpWithTemplate(
		phone: string,
		otp: string,
		appName: string = 'MyApp',
		channel: 'generic' | 'dnd' | 'whatsapp' = 'dnd'
	): Promise<ISmsResult> {
		const message = `${otp} is your ${appName} verification code. Valid for 5 minutes. Do not share this code.`;

		return await this.sendSms({
			phone,
			message,
			channel,
			type: 'plain',
		});
	}

	/**
	 * Send welcome SMS
	 */
	async sendWelcomeSms(phone: string, firstName: string): Promise<ISmsResult> {
		const message = `Hi ${firstName}, welcome! We're excited to have you on board. Get started now!`;

		return await this.sendSms({
			phone,
			message,
			channel: 'generic',
			type: 'plain',
		});
	}

	/**
	 * Send transaction alert SMS
	 */
	async sendTransactionAlert(
		phone: string,
		amount: number,
		type: 'credit' | 'debit',
		balance: number,
		currency: string = 'NGN'
	): Promise<ISmsResult> {
		const action = type === 'credit' ? 'credited' : 'debited';
		const message = `Your account has been ${action} with ${currency}${amount.toLocaleString()}. New balance: ${currency}${balance.toLocaleString()}`;

		return await this.sendSms({
			phone,
			message,
			channel: 'dnd', // Use DND for transactional messages
			type: 'plain',
		});
	}

	/**
	 * Handle errors from Termii API
	 */
	private handleError(error: unknown, phone: string): ISmsResult {
		if (axios.isAxiosError(error)) {
			const axiosError = error as AxiosError<ITermiiErrorResponse>;

			if (axiosError.response) {
				// Server responded with error
				const errorMessage = axiosError.response.data?.message || 'Failed to send SMS';

				console.error('Termii API error:', {
					status: axiosError.response.status,
					message: errorMessage,
					phone,
				});

				return {
					success: false,
					error: errorMessage,
				};
			} else if (axiosError.request) {
				// Request made but no response received
				console.error('Termii API no response:', {
					message: 'No response from SMS service',
					phone,
				});

				return {
					success: false,
					error: 'SMS service unavailable',
				};
			}
		}

		// Unknown error
		console.error('SMS sending error:', error);

		return {
			success: false,
			error: 'Failed to send SMS',
		};
	}

	/**
	 * Validate phone number format
	 */
	validatePhone(phone: string): boolean {
		// Remove spaces and special characters
		const cleaned = phone.replace(/[\s()-]/g, '');

		// Check if it's a valid Nigerian number (starts with +234 or 234 or 0)
		const nigerianPattern = /^(\+?234|0)[7-9][0-1]\d{8}$/;

		return nigerianPattern.test(cleaned);
	}

	/**
	 * Format phone number to international format
	 */
	formatPhone(phone: string): string {
		// Remove spaces and special characters
		let cleaned = phone.replace(/[\s()-]/g, '');

		// If starts with 0, replace with 234
		if (cleaned.startsWith('0')) {
			cleaned = '234' + cleaned.slice(1);
		}

		// Remove + if present
		cleaned = cleaned.replace(/^\+/, '');

		return cleaned;
	}
}

export const smsService = new SmsService();
