import { knexDb } from '@/common/config';
import { IWishlist, IWishlistView } from '@/common/interfaces';
import { DateTime } from 'luxon';

class WishlistViewRepository {
	create = async (payload: Partial<IWishlistView>) => {
		return await knexDb.table('wishlist_views').insert(payload).returning('*');
	};

	getUniqueViewsCount = async (wishlistId: string): Promise<number> => {
		const result = await knexDb('wishlist_views').countDistinct('ipAddress as count').where({ wishlistId }).first();

		return parseInt(String(result?.count ?? '0'), 10);
	};

	update = async (id: string, payload: Partial<IWishlistView>): Promise<IWishlistView[]> => {
		return await knexDb('wishlist_views')
			.where({ id })
			.update({ ...payload, updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};

	findByWishlistId = async (wishlistId: string, page = 1, limit = 50): Promise<IWishlistView[]> => {
		const offset = (page - 1) * limit;
		return await knexDb
			.table('wishlist_views')
			.where({ wishlistId })
			.orderBy('created_at', 'desc')
			.limit(limit)
			.offset(offset);
	};

	countByWishlistId = async (wishlistId: string): Promise<number> => {
		const result = await knexDb
			.table('wishlist_views')
			.where({ wishlistId })
			.count<{ count: string }[]>('* as count')
			.first();
		return Number(result?.count || 0);
	};

	incrementViewCount = async (id: string): Promise<IWishlist[]> => {
		return await knexDb('wishlists').where({ id }).increment('viewsCount', 1).returning('*');
	};

	hasRecentView = async (wishlistId: string, ipAddress: string): Promise<boolean> => {
		const result = await knexDb.table('wishlist_views').where({ wishlistId, ipAddress }).first();
		return !!result;
	};

	trackView = async (
		wishlistId: string,
		data: {
			ipAddress?: string;
			userAgent?: string;
			referrer?: string;
		}
	): Promise<void> => {
		if (data.ipAddress) {
			const hasRecentView = await wishlistViewRepository.hasRecentView(wishlistId, data.ipAddress);
			if (hasRecentView) {
				return;
			}
		}

		await knexDb.transaction(async (trx) => {
			await trx('wishlist_views').insert({
				wishlistId,
				ipAddress: data.ipAddress,
				userAgent: data.userAgent,
				referrer: data.referrer,
			});

			await trx('wishlists').where({ id: wishlistId }).increment('viewsCount', 1).update({ updated_at: new Date() });
		});
	};
}

export const wishlistViewRepository = new WishlistViewRepository();
