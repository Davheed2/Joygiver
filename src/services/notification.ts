import * as admin from 'firebase-admin';
import { Message, MulticastMessage } from 'firebase-admin/messaging';
import { deviceTokenRepository } from '@/modules/notification/repository';
import { AppError } from '@/common/utils';
import { DataPayload, NotificationPayload, SendNotificationResult, ServiceAccountJSON } from '@/common/interfaces';
import { ENVIRONMENT } from '@/common/config';

const serviceAccount = JSON.parse(ENVIRONMENT.FIREBASE.SERVICE_ACCOUNT_KEY);
const sa = serviceAccount as unknown as ServiceAccountJSON;

const serviceAccountCred: admin.ServiceAccount = {
	projectId: sa.project_id ?? sa.projectId,
	clientEmail: sa.client_email ?? sa.clientEmail,
	privateKey: (sa.private_key ?? sa.privateKey)?.replace(/\\n/g, '\n'),
};

if (!serviceAccountCred.projectId || !serviceAccountCred.clientEmail || !serviceAccountCred.privateKey) {
	throw new Error('Firebase service account is missing required fields (projectId, clientEmail, or privateKey).');
}

admin.initializeApp({
	credential: admin.credential.cert(serviceAccountCred),
});

// Sound configuration
const NOTIFICATION_SOUNDS = {
	money_received: 'money_received.wav',
	withdrawal_success: 'money_received.wav',
	withdrawal_failed: 'money_received.wav',
	transaction_pending: 'money_received.wav',
	default: 'money_received.wav', // System default sound
} as const;

type NotificationSound = keyof typeof NOTIFICATION_SOUNDS;

class NotificationService {
	private readonly messaging = admin.messaging();

	/**
	 * Send notification to a single user (all their devices)
	 */
	async notifyUser(
		userId: string,
		notification: NotificationPayload,
		data: DataPayload = {},
		sound?: NotificationSound
	): Promise<SendNotificationResult> {
		try {
			const tokens = await deviceTokenRepository.getActiveTokenStrings(userId);

			if (tokens.length === 0) {
				console.log(`No active tokens found for user: ${userId}`);
				return {
					success: true,
					successCount: 0,
					failureCount: 0,
					failedTokens: [],
				};
			}

			return await this.sendToMultipleTokens(tokens, notification, data, sound);
		} catch (error) {
			console.error('Error notifying user:', error);
			throw new AppError('Failed to send notification', 500);
		}
	}

	/**
	 * Send notification to multiple users
	 */
	async notifyMultipleUsers(
		userIds: string[],
		notification: NotificationPayload,
		data: DataPayload = {},
		sound?: NotificationSound
	): Promise<SendNotificationResult> {
		try {
			const userTokensMap = await deviceTokenRepository.getActiveTokenStringsByUserIds(userIds);

			const allTokens: string[] = [];
			userTokensMap.forEach((tokens) => allTokens.push(...tokens));

			if (allTokens.length === 0) {
				console.log('No active tokens found for any of the users');
				return {
					success: true,
					successCount: 0,
					failureCount: 0,
					failedTokens: [],
				};
			}

			return await this.sendToMultipleTokens(allTokens, notification, data, sound);
		} catch (error) {
			console.error('Error notifying multiple users:', error);
			throw new AppError('Failed to send notifications', 500);
		}
	}

	/**
	 * Send notification when user receives money
	 */
	async notifyMoneyReceived(
		userId: string,
		amount: number,
		currency: string = 'NGN',
		senderName?: string
	): Promise<SendNotificationResult> {
		const notification: NotificationPayload = {
			title: 'Money Received! 💰',
			body: senderName
				? `You received ${currency} ${amount.toLocaleString()} from ${senderName}`
				: `You received ${currency} ${amount.toLocaleString()}`,
		};

		const data: DataPayload = {
			type: 'money_received',
			amount: amount.toString(),
			currency,
			...(senderName && { senderName }),
			timestamp: new Date().toISOString(),
		};

		// Use custom sound for money received
		return await this.notifyUser(userId, notification, data, 'money_received');
	}

	/**
	 * Send notification when withdrawal is successful
	 */
	async notifyWithdrawalSuccess(
		userId: string,
		amount: number,
		currency: string = 'NGN',
		accountNumber?: string
	): Promise<SendNotificationResult> {
		const notification: NotificationPayload = {
			title: 'Withdrawal Successful ✅',
			body: accountNumber
				? `Your withdrawal of ${currency} ${amount.toLocaleString()} to ${accountNumber} was successful`
				: `Your withdrawal of ${currency} ${amount.toLocaleString()} was successful`,
		};

		const data: DataPayload = {
			type: 'withdrawal_success',
			amount: amount.toString(),
			currency,
			...(accountNumber && { accountNumber }),
			timestamp: new Date().toISOString(),
		};

		return await this.notifyUser(userId, notification, data, 'withdrawal_success');
	}

	/**
	 * Send notification when withdrawal fails
	 */
	async notifyWithdrawalFailed(
		userId: string,
		amount: number,
		currency: string = 'NGN',
		reason?: string
	): Promise<SendNotificationResult> {
		const notification: NotificationPayload = {
			title: 'Withdrawal Failed ❌',
			body: reason
				? `Your withdrawal of ${currency} ${amount.toLocaleString()} failed: ${reason}`
				: `Your withdrawal of ${currency} ${amount.toLocaleString()} failed`,
		};

		const data: DataPayload = {
			type: 'withdrawal_failed',
			amount: amount.toString(),
			currency,
			...(reason && { reason }),
			timestamp: new Date().toISOString(),
		};

		return await this.notifyUser(userId, notification, data, 'withdrawal_failed');
	}

	/**
	 * Send notification for pending transaction
	 */
	async notifyPendingTransaction(
		userId: string,
		transactionType: 'deposit' | 'withdrawal',
		amount: number,
		currency: string = 'NGN'
	): Promise<SendNotificationResult> {
		const notification: NotificationPayload = {
			title: 'Transaction Pending ⏳',
			body: `Your ${transactionType} of ${currency} ${amount.toLocaleString()} is being processed`,
		};

		const data: DataPayload = {
			type: 'transaction_pending',
			transactionType,
			amount: amount.toString(),
			currency,
			timestamp: new Date().toISOString(),
		};

		return await this.notifyUser(userId, notification, data, 'transaction_pending');
	}

	/**
	 * Send custom notification
	 */
	async sendCustomNotification(
		userId: string,
		title: string,
		body: string,
		data: DataPayload = {},
		sound?: NotificationSound
	): Promise<SendNotificationResult> {
		return await this.notifyUser(userId, { title, body }, data, sound);
	}

	/**
	 * Send notification to multiple tokens (internal helper)
	 */
	private async sendToMultipleTokens(
		tokens: string[],
		notification: NotificationPayload,
		data: DataPayload = {},
		sound?: NotificationSound
	): Promise<SendNotificationResult> {
		try {
			const BATCH_SIZE = 500;
			let totalSuccess = 0;
			let totalFailure = 0;
			let allFailedTokens: string[] = [];

			for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
				const batch = tokens.slice(i, i + BATCH_SIZE);
				const result = await this.sendBatch(batch, notification, data, sound);

				totalSuccess += result.successCount;
				totalFailure += result.failureCount;
				allFailedTokens = allFailedTokens.concat(result.failedTokens);
			}

			if (allFailedTokens.length > 0) {
				await deviceTokenRepository.deactivateMultiple(allFailedTokens);
				console.log(`Deactivated ${allFailedTokens.length} invalid tokens`);
			}

			return {
				success: true,
				successCount: totalSuccess,
				failureCount: totalFailure,
				failedTokens: allFailedTokens,
			};
		} catch (error) {
			console.error('Error sending to multiple tokens:', error);
			return {
				success: false,
				successCount: 0,
				failureCount: tokens.length,
				failedTokens: tokens,
				error: error instanceof Error ? error.message : 'Unknown error',
			};
		}
	}

	/**
	 * Send a batch of notifications (up to 500 tokens)
	 */
	private async sendBatch(
		tokens: string[],
		notification: NotificationPayload,
		data: DataPayload = {},
		sound?: NotificationSound
	): Promise<{ successCount: number; failureCount: number; failedTokens: string[] }> {
		// Get the sound file name
		const soundFile = sound ? NOTIFICATION_SOUNDS[sound] : NOTIFICATION_SOUNDS.default;

		const message: MulticastMessage = {
			tokens,
			notification: {
				title: notification.title,
				body: notification.body,
				...(notification.image && { imageUrl: notification.image }),
			},
			data,
			android: {
				priority: 'high',
				notification: {
					channelId: 'default',
					sound: soundFile, // Custom sound for Android
					color: '#4F46E5',
					defaultVibrateTimings: true,
				},
			},
			apns: {
				payload: {
					aps: {
						sound: soundFile, // Custom sound for iOS
						badge: 1,
						contentAvailable: true,
					},
				},
				headers: {
					'apns-priority': '10',
				},
			},
		};

		const response = await this.messaging.sendEachForMulticast(message);

		const failedTokens: string[] = [];
		response.responses.forEach((resp, idx) => {
			if (!resp.success) {
				failedTokens.push(tokens[idx]);
				console.error(`Failed to send to token ${tokens[idx]}:`, resp.error?.message);
			}
		});

		return {
			successCount: response.successCount,
			failureCount: response.failureCount,
			failedTokens,
		};
	}

	/**
	 * Send data-only message (silent notification)
	 */
	async sendDataOnly(userId: string, data: DataPayload): Promise<SendNotificationResult> {
		try {
			const tokens = await deviceTokenRepository.getActiveTokenStrings(userId);

			if (tokens.length === 0) {
				return {
					success: true,
					successCount: 0,
					failureCount: 0,
					failedTokens: [],
				};
			}

			const results = await Promise.allSettled(tokens.map((token) => this.sendDataOnlyToToken(token, data)));

			let successCount = 0;
			let failureCount = 0;
			const failedTokens: string[] = [];

			results.forEach((result, idx) => {
				if (result.status === 'fulfilled' && result.value) {
					successCount++;
				} else {
					failureCount++;
					failedTokens.push(tokens[idx]);
				}
			});

			if (failedTokens.length > 0) {
				await deviceTokenRepository.deactivateMultiple(failedTokens);
			}

			return {
				success: true,
				successCount,
				failureCount,
				failedTokens,
			};
		} catch (error) {
			console.error('Error sending data-only message:', error);
			throw new AppError('Failed to send data-only message', 500);
		}
	}

	/**
	 * Send data-only message to a single token
	 */
	private async sendDataOnlyToToken(token: string, data: DataPayload): Promise<boolean> {
		try {
			const message: Message = {
				token,
				data,
				android: {
					priority: 'high',
				},
				apns: {
					payload: {
						aps: {
							contentAvailable: true,
						},
					},
					headers: {
						'apns-push-type': 'background',
						'apns-priority': '5',
						'apns-topic': process.env.IOS_BUNDLE_ID || '',
					},
				},
			};

			await this.messaging.send(message);
			return true;
		} catch (error) {
			console.error('Error sending data-only to token:', error);
			return false;
		}
	}

	/**
	 * Validate if a token is still valid
	 */
	async validateToken(token: string): Promise<boolean> {
		try {
			await this.messaging.send(
				{
					token,
					data: { test: 'validation' },
				},
				true
			);
			return true;
		} catch (error) {
			console.error('Token validation failed:', error);
			return false;
		}
	}
}

export const notificationService = new NotificationService();
