import { knexDb } from '@/common/config';
import { IWishlistView } from '@/common/interfaces';
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
}

export const wishlistViewRepository = new WishlistViewRepository();
