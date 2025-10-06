import { z } from 'zod';
import { uuidZ } from '@/schemas/common';
import { PhoneNumberUtil } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

export const wishlistModuleSchema = z
	.object({
		// ==================== WISHLIST FIELDS ====================
		celebrationEvent: z
			.string()
			.min(1, 'Celebration event is required')
			.max(100, 'Celebration event must be less than 100 characters')
			.optional(),
		celebrationDate: z
			.string()
			.optional()
			.refine(
				(val) => {
					if (!val) return true;
					const regex = /^\d{4}-\d{2}-\d{2}$/;
					if (!regex.test(val)) return false;

					const date = new Date(val);
					return !isNaN(date.getTime());
				},
				{
					message: 'Invalid date format. Use YYYY-MM-DD',
				}
			),
		giftSelectionMode: z.enum(['pick_by_yourself', 'help_me_choose']).optional(),
		budget: z.number().positive().optional(),
		budgetMin: z.number().positive().optional(),
		budgetMax: z.number().positive().optional(),
		categoryIds: z.array(uuidZ).optional(),
		description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
		coverImage: z.string().url('Cover image must be a valid URL').optional(),
		status: z.enum(['draft', 'active', 'completed', 'expired']).optional(),
		isPublic: z.boolean().optional(),
		wishlistId: uuidZ.optional(),
		uniqueLink: z.string().optional(),

		// ==================== WISHLIST ITEM FIELDS ====================
		items: z
			.array(
				z.object({
					curatedItemId: uuidZ.optional(),
					// name: z.string().min(1).max(255),
					// description: z.string().max(1000).optional(),
					// imageUrl: z.string().url().optional(),
					// price: z.number().positive(),
					// quantity: z.number().int().positive().optional(),
					// categoryId: uuidZ,
					// productLink: z.string().url().optional(),
					// priority: z.number().int().positive().optional(),
				})
			)
			.optional(),
		//itemId: uuidZ.optional(),
		curatedItemId: uuidZ.optional(),
		name: z.string().min(1).max(255).optional(),
		imageUrl: z.string().url().optional(),
		price: z.number().positive().optional(),
		//quantity: z.number().int().positive().optional(),
		categoryId: uuidZ.optional(),
		//priority: z.number().int().positive().optional(),

		// ==================== CONTRIBUTION FIELDS ====================
		wishlistItemId: uuidZ.optional(),
		contributorName: z.string().min(1).max(255).optional(),
		contributorEmail: z
			.string()
			.email()
			.optional()
			.transform((s) => s?.toLowerCase()),
		contributorPhone: z
			.string()
			.optional()
			.refine(
				(val) => {
					if (!val) return true;

					try {
						const number = phoneUtil.parseAndKeepRawInput(val, 'NG');
						return phoneUtil.isValidNumber(number);
					} catch {
						return false;
					}
				},
				{
					message: 'Invalid phone number. Please provide a valid international format (e.g., +2348012345678)',
				}
			),
		amount: z.number().positive().optional(),
		message: z.string().max(500).optional(),
		isAnonymous: z.boolean().optional(),
		paymentMethod: z.enum(['paystack', 'flutterwave', 'bank_transfer', 'card']).optional(),
		paymentReference: z.string().optional(),
		contributionId: uuidZ.optional(),
        iconUrl: z.string().url().optional(),

		// ==================== QUERY PARAMS ====================
		page: z.number().int().positive().optional(),
		limit: z.number().int().positive().optional(),
		sortBy: z.enum(['created_at', 'celebration_date', 'views_count', 'total_contributed']).optional(),
		sortOrder: z.enum(['asc', 'desc']).optional(),
		referrer: z.string().url().optional(),
		gender: z.enum(['male', 'female', 'prefer_not_to_say']).optional(),
		minPrice: z.number().positive().optional(),
		maxPrice: z.number().positive().optional(),

		// ==================== CURATED ITEM FIELDS (ADMIN) ====================
		curatedItemName: z.string().min(1).max(255).optional(),
		popularity: z.number().int().min(0).optional(),
		isActive: z.boolean().optional(),
	})
	.strict();

export type WishlistModuleInput = z.infer<typeof wishlistModuleSchema>;
export default wishlistModuleSchema;
