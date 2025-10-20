import { z } from 'zod';
import { nameZ, uuidZ } from '@/schemas/common';

export const notificationDataSchema = z.record(z.string(), z.string(), {
	errorMap: () => ({ message: 'Notification data must be a record of string key-value pairs' }),
});

export const notificationModuleSchema = z
	.object({
		token: z.string(),
		platform: z.enum(['ios', 'android'], {
			errorMap: () => ({ message: 'Platform must be either "ios" or "android"' }),
		}),
		deviceId: z.string().max(255).optional(),
		daysOld: z.number().int().min(1, 'Days must be at least 1').max(365, 'Days must not exceed 365').default(30),
		title: z
			.string()
			.transform((s) => s.trim())
			.optional(),
		body: z
			.string()
			.transform((s) => s.trim())
			.optional(),
		userId: uuidZ.optional(),
		data: notificationDataSchema.optional(),
		userIds: z
			.array(uuidZ)
			.min(1, 'At least one user ID is required')
			.max(1000, 'Cannot send to more than 1000 users at once')
			.optional(),
		amount: z.number().positive('Amount must be positive').max(1000000000, 'Amount is too large').optional(),
		currency: z
			.string()
			.length(3, 'Currency must be a 3-letter code')
			.transform((s) => s.toUpperCase())
			.default('NGN'),
		senderName: nameZ.optional(),
		accountNumber: z.string().max(50, 'Account number must not exceed 50 characters').optional(),
		reason: z.string().max(200, 'Reason must not exceed 200 characters').optional(),
		transactionType: z
			.enum(['deposit', 'withdrawal'], {
				errorMap: () => ({ message: 'Transaction type must be either "deposit" or "withdrawal"' }),
			})
			.optional(),
		topic: z
			.string()
			.min(1, 'Topic is required')
			.max(255, 'Topic must not exceed 255 characters')
			.regex(/^[a-zA-Z0-9_-]+$/, 'Topic can only contain letters, numbers, hyphens, and underscores')
			.optional(),
		notificationType: z.string().optional(),
	})
	.strict();

export type NotificationModuleInput = z.infer<typeof notificationModuleSchema>;
export default notificationModuleSchema;
