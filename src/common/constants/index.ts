/**
 * App wide constants go here
 *
 * e.g
 * export const APP_NAME = 'MyApp';
 */
export enum Role {
	SuperUser = 'superuser',
	User = 'user',
	Admin = 'admin',
}

export enum AuthProvider {
	Local = 'local',
	Google = 'google',
	Facebook = 'facebook',
}

export enum WishlistStatus {
	DRAFT = 'draft',
	ACTIVE = 'active',
	COMPLETED = 'completed',
	EXPIRED = 'expired',
}

export enum GiftSelectionMode {
	PICK_FOR_ME = 'pick_for_me',
	HELP_ME_CHOOSE = 'help_me_choose',
}

export enum Gender {
	MALE = 'male',
	FEMALE = 'female',
	PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export enum ContributionStatus {
	PENDING = 'pending',
	COMPLETED = 'completed',
	FAILED = 'failed',
	REFUNDED = 'refunded',
}

export enum WithdrawalStatus {
	PENDING = 'pending',
	PROCESSING = 'processing',
	COMPLETED = 'completed',
	FAILED = 'failed',
	CANCELLED = 'cancelled',
}

export enum TransactionType {
	CONTRIBUTION = 'contribution',
	WITHDRAWAL = 'withdrawal',
	REFUND = 'refund',
	FEE = 'fee',
}

export const WITHDRAWAL_LIMITS = {
	MIN: 1000,
	MAX_STANDARD: 50000,
	MAX_VERIFIED: 500000,
};

export const WITHDRAWAL_FEES = {
	BASE: 10,
	PERCENTAGE: 0.005,
	CAP: 50,
};
