import { ContributionStatus, Gender, GiftSelectionMode, WishlistStatus } from "../constants";

export interface IWishlist {
  id: string;
  userId: string;
  celebrationEvent: string; // e.g., "Birthday", "Wedding", "Graduation"
  celebrationDate: Date;
  giftSelectionMode: GiftSelectionMode;
  budget: number;
  budgetMin?: number;
  budgetMax?: number;
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
  wishlistId: string;
  curatedItemId?: string; // Reference to curated item if picked from defaults
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  quantityFulfilled: number;
  amountContributed: number;
  priority: number; // 1 = highest priority
  isCustom: boolean; // true if user added custom item
  categoryId: string;
  productLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICuratedItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  categoryId: string;
  gender: Gender;
  tags: string[];
  popularity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface IWishlistView {
  id: string;
  wishlistId: string;
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  viewedAt: Date;
}