import { z } from 'zod';
import { uuidZ } from '@/schemas/common';

export const walletModuleSchema = z
	.object({
		// ==================== WALLET FIELDS ====================
		walletId: uuidZ.optional(),
		userId: uuidZ.optional(),
		availableBalance: z.number().min(0).optional(),
		pendingBalance: z.number().min(0).optional(),
		totalReceived: z.number().min(0).optional(),
		totalWithdrawn: z.number().min(0).optional(),

		// ==================== PAYOUT METHOD FIELDS ====================
		payoutMethodId: uuidZ.optional(),
		accountName: z.string().min(1).max(255).optional(),
		accountNumber: z
			.string()
			.regex(/^\d{10}$/, 'Account number must be 10 digits')
			.optional(),
		bankName: z.string().min(1).max(255).optional(),
		bankCode: z.string().optional(),
		bvn: z
			.string()
			.regex(/^\d{11}$/, 'BVN must be 11 digits')
			.optional(),
		recipientCode: z.string().optional(), // Paystack transfer recipient code
		isVerified: z.boolean().optional(),
		isPrimary: z.boolean().optional(),

		// ==================== WITHDRAWAL REQUEST FIELDS ====================
		withdrawalId: uuidZ.optional(),
		amount: z.number().positive('Amount must be positive').optional(),
		fee: z.number().min(0).optional(),
		netAmount: z.number().positive().optional(),
		status: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled']).optional(),
		paymentReference: z.string().optional(),
		transferCode: z.string().optional(), // Paystack transfer code
		failureReason: z.string().max(500).optional(),
		processedAt: z.string().optional(),

		// ==================== TRANSACTION FIELDS ====================
		transactionId: uuidZ.optional(),
		type: z.enum(['contribution', 'withdrawal', 'refund', 'fee']).optional(),
		description: z.string().max(500).optional(),
		metadata: z.record(z.any()).optional(),

		// ==================== QUERY PARAMS ====================
		page: z.number().int().positive().optional(),
		limit: z.number().int().positive().optional(),
		sortBy: z.enum(['created_at', 'amount', 'status']).optional(),
		sortOrder: z.enum(['asc', 'desc']).optional(),
		startDate: z.string().optional(),
		endDate: z.string().optional(),
		statusFilter: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled']).optional(),
	})
	.strict();

export type WalletModuleInput = z.infer<typeof walletModuleSchema>;
export default walletModuleSchema;
