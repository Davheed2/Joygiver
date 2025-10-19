import { z } from 'zod';
import { nameZ, uuidZ } from '@/schemas/common';

export const notificationDataSchema = z.record(z.string(), z.string(), {
	errorMap: () => ({ message: 'Notification data must be a record of string key-value pairs' }),
});

export const notificationModuleSchema = z
	.object({
		token: z
			.string()
			.min(100, 'Device token must be at least 100 characters')
			.max(200, 'Device token must not exceed 200 characters'),
		platform: z.enum(['ios', 'android'], {
			errorMap: () => ({ message: 'Platform must be either "ios" or "android"' }),
		}),
		deviceId: z.string().max(255).optional(),
		daysOld: z.number().int().min(1, 'Days must be at least 1').max(365, 'Days must not exceed 365').default(30),
		title: z
			.string()
			.min(1, 'Title is required')
			.max(100, 'Title must not exceed 100 characters')
			.transform((s) => s.trim()),
		body: z
			.string()
			.min(1, 'Body is required')
			.max(500, 'Body must not exceed 500 characters')
			.transform((s) => s.trim()),
		image: z.string().url('Image must be a valid URL').optional(),
		userId: uuidZ,
		data: notificationDataSchema.optional(),
		userIds: z
			.array(uuidZ)
			.min(1, 'At least one user ID is required')
			.max(1000, 'Cannot send to more than 1000 users at once'),
		amount: z.number().positive('Amount must be positive').max(1000000000, 'Amount is too large'),
		currency: z
			.string()
			.length(3, 'Currency must be a 3-letter code')
			.transform((s) => s.toUpperCase())
			.default('NGN'),
		senderName: nameZ,
		accountNumber: z.string().max(50, 'Account number must not exceed 50 characters').optional(),
		reason: z.string().max(200, 'Reason must not exceed 200 characters').optional(),
		transactionType: z.enum(['deposit', 'withdrawal'], {
			errorMap: () => ({ message: 'Transaction type must be either "deposit" or "withdrawal"' }),
		}),
		topic: z
			.string()
			.min(1, 'Topic is required')
			.max(255, 'Topic must not exceed 255 characters')
			.regex(/^[a-zA-Z0-9_-]+$/, 'Topic can only contain letters, numbers, hyphens, and underscores'),
		startDate: z
			.string()
			.refine(
				(val) => {
					const regex = /^\d{4}-\d{2}-\d{2}$/;
					if (!regex.test(val)) return false;
					const date = new Date(val);
					return !isNaN(date.getTime());
				},
				{
					message: 'Invalid start date. Use format YYYY-MM-DD',
				}
			)
			.optional(),
		endDate: z
			.string()
			.refine(
				(val) => {
					const regex = /^\d{4}-\d{2}-\d{2}$/;
					if (!regex.test(val)) return false;
					const date = new Date(val);
					return !isNaN(date.getTime());
				},
				{
					message: 'Invalid end date. Use format YYYY-MM-DD',
				}
			)
			.optional(),
		notificationType: z.string().optional(),
	})
	.strict();

export type NotificationModuleInput = z.infer<typeof notificationModuleSchema>;
export default notificationModuleSchema;
