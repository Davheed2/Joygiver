import { knexDb } from '@/common/config';
import { IWishlistItem } from '@/common/interfaces';
import { DateTime } from 'luxon';

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
        return await knexDb('wishlist_items')
            .where({ id })
            .increment('totalContributed', amount)
            .returning('*');
    }
}

export const wishlistItemRepository = new WishlistItemRepository();
