import { knexDb } from '@/common/config';
import { IWishlistItem } from '@/common/interfaces';
import { AppError } from '@/common/utils';
import { DateTime } from 'luxon';
import { contributionRepository } from './contributionRepository';

class WishlistItemRepository {
	create = async (payload: Partial<IWishlistItem>) => {
		return await knexDb.table('wishlist_items').insert(payload).returning('*');
	};

	createMany = async (payloads: Partial<IWishlistItem>[]) => {
		return await knexDb.table('wishlist_items').insert(payloads).returning('*');
	};

	findById = async (id: string): Promise<IWishlistItem | null> => {
		return await knexDb.table('wishlist_items').where({ id }).first();
	};

	findByWishlistId = async (wishlistId: string): Promise<IWishlistItem[]> => {
		return await knexDb.table('wishlist_items').where({ wishlistId }).orderBy('created_at', 'desc');
	};

	update = async (id: string, payload: Partial<IWishlistItem>): Promise<IWishlistItem[]> => {
		return await knexDb('wishlist_items')
			.where({ id })
			.update({ ...payload, updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};

	updateContribution = async (id: string, amount: number): Promise<IWishlistItem[]> => {
		return await knexDb('wishlist_items').where({ id }).increment('totalContributed', amount).returning('*');
	};

	findByUniqueLink = async (uniqueLink: string): Promise<IWishlistItem | null> => {
		return await knexDb.table('wishlist_items').where({ uniqueLink }).first();
	};

	getWishlistItemStats = async (wishlistItemId: string) => {
		const item = await wishlistItemRepository.findById(wishlistItemId);
		if (!item) {
			throw new AppError('Wishlist item not found', 404);
		}

		const recentContributions = await contributionRepository.findByWishlistItemId(wishlistItemId, 1, 5);
		
		const recentSupporters = recentContributions.map((c) => ({
			name: c.isAnonymous ? 'Anonymous' : c.contributorName,
			amount: c.amount,
			date: c.created_at,
			message: c.message,
		}));

		const completionPercentage = item.price > 0 ? (item.totalContributed / item.price) * 100 : 0;

		return {
			totalContributed: item.totalContributed,
			contributorsCount: item.contributorsCount,
			viewsCount: item.viewsCount,
			sharesCount: item.sharesCount,
			completionPercentage: Math.min(100, Math.round(completionPercentage)),
			isFunded: item.isFunded,
			recentSupporters,
		};
	};

}

export const wishlistItemRepository = new WishlistItemRepository();
