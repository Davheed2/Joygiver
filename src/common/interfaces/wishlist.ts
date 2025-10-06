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
	priority: number; // 1 = highest priority
	wishlistId: string;
	curatedItemId?: string; // Reference to curated item if picked from defaults
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

export interface IContribution {
	id: string;
	wishlistId: string;
	wishlistItemId?: string; // Optional: specific item contributed to
	contributorName: string;
	contributorEmail?: string;
	contributorPhone?: string;
	amount: number;
	message?: string;
	isAnonymous: boolean;
	status: ContributionStatus;
	paymentReference: string;
	paymentMethod: string;
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
