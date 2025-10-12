import { knexDb } from '@/common/config';
import { IWishlistItem, IWishlistItemView } from '@/common/interfaces';
import { DateTime } from 'luxon';
import { wishlistItemRepository } from './wishlistItemRepository';
import { AppError } from '@/common/utils';

class WishlistItemViewRepository {
	create = async (payload: Partial<IWishlistItemView>) => {
		return await knexDb.table('wishlist_item_views').insert(payload).returning('*');
	};

	getUniqueViewsCount = async (wishlistItemId: string): Promise<number> => {
		const result = await knexDb('wishlist_item_views')
			.countDistinct('ipAddress as count')
			.where({ wishlistItemId })
			.first();

		return parseInt(String(result?.count ?? '0'), 10);
	};

	update = async (id: string, payload: Partial<IWishlistItemView>): Promise<IWishlistItemView[]> => {
		return await knexDb('wishlist_item_views')
			.where({ id })
			.update({ ...payload, updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};

	hasRecentView = async (wishlistItemId: string, ipAddress: string): Promise<boolean> => {
		const result = await knexDb.table('wishlist_item_views').where({ wishlistItemId, ipAddress }).first();
		console.log(result);
		return !!result;
	};

	findByUniqueLink = async (uniqueLink: string): Promise<IWishlistItem | null> => {
		return await knexDb.table('wishlist_item_views').where({ uniqueLink }).first();
	};

	trackView = async (
		wishlistItemId: string,
		data: {
			ipAddress?: string;
			userAgent?: string;
			referrer?: string;
		}
	): Promise<void> => {
		const item = await wishlistItemRepository.findById(wishlistItemId);
		if (!item) {
			throw new AppError('Wishlist item not found', 404);
		}

		if (data.ipAddress) {
			const hasRecentView = await this.hasRecentView(wishlistItemId, data.ipAddress);
			if (hasRecentView) {
				return;
			}
		}

		await knexDb.transaction(async (trx) => {
			await trx('wishlist_item_views').insert({
				wishlistItemId,
				wishlistId: item.wishlistId,
				ipAddress: data.ipAddress,
				userAgent: data.userAgent,
				referrer: data.referrer,
			});

			await trx('wishlist_items')
				.where({ id: wishlistItemId })
				.increment('viewsCount', 1)
				.update({ updated_at: new Date() });

		});
	};
}

export const wishlistItemViewRepository = new WishlistItemViewRepository();
