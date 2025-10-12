import { ContributionStatus, Gender, GiftSelectionMode, WishlistStatus } from '../constants';

export interface IWishlist {
	id: string;
	userId: string;
	celebrationEvent: string;
	celebrationDate: Date;
	giftSelectionMode: GiftSelectionMode;
	uniqueLink: string;
	status: WishlistStatus;
	totalContributed: number;
	contributorsCount: number;
	viewsCount: number;
	sharesCount: number;
	isPublic: boolean;
	expiresAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface IWishlistItem {
	id: string;
	name: string;
	imageUrl?: string;
	price: number;
	quantity: number;
	quantityFulfilled: number;
	amountContributed: number;
	priority: number; 
	wishlistId: string;
	curatedItemId?: string;
	totalContributed: number;
	uniqueLink: string;
	contributorsCount: number;
	isFunded: boolean;
	fundedAt?: Date;
	viewsCount: number;
	sharesCount: number;
	categoryId: string;
	created_at?: Date;
	updated_at?: Date;
}

export interface ICuratedItem {
	id: string;
	name: string;
	imageUrl: string;
	price: number;
	categoryId: string;
	gender: Gender;
	popularity: number;
	isActive: boolean;
	created_at?: Date;
	updated_at?: Date;
}

export interface ICategory {
	id: string;
	name: string;
	iconUrl?: string;
	isActive: boolean;
	created_at?: Date;
	updated_at?: Date;
}

export interface IWishlistView {
	id: string;
	wishlistId: string;
	ipAddress: string;
	userAgent: string;
	referrer?: string;
	viewedAt: Date;
}

export interface IWishlistShare {
	id: string;
	wishlistId: string;
	wishlistItemId?: string;
	platform: 'whatsapp' | 'facebook' | 'twitter' | 'instagram' | 'email' | 'copy_link' | 'other';
	ipAddress?: string;
	created_at: Date;
	updated_at: Date;
}

export interface IWishlistItemView {
	id: string;
	wishlistId: string;
	ipAddress: string;
	userAgent: string;
	referrer?: string;
	viewedAt: Date;
}

export interface IContribution {
	id: string;
	wishlistId: string;
	wishlistItemId: string;
	userId?: string;
	contributorName: string;
	contributorEmail: string;
	contributorPhone?: string;
	message?: string;
	isAnonymous: boolean;
	amount: number;
	status: ContributionStatus;
	paymentMethod: 'paystack' | 'flutterwave' | 'bank_transfer';
	paymentReference: string;
	paystackReference?: string;
	ownerReply?: string;
	repliedAt?: Date;
	metadata?: Record<string, unknown>;
	paidAt?: Date;
	created_at: Date;
	updated_at: Date;
}

export interface IContributorStats {
	rank: number;
	contributorName: string;
	contributorInitials: string;
	totalAmount: number;
	contributionCount: number;
	lastContribution: Date;
}

export interface IWishlistStats {
	totalContributed: number;
	contributorsCount: number;
	viewsCount: number;
	sharesCount: number;
	itemsCount: number;
	fundedItemsCount: number;
	completionPercentage: number;
	topContributors: IContributorStats[];
}
