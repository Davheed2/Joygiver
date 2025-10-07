import { knexDb } from '@/common/config';
import { IWishlist } from '@/common/interfaces';
import { DateTime } from 'luxon';

class WishlistRepository {
	create = async (payload: Partial<IWishlist>) => {
		return await knexDb.table('wishlists').insert(payload).returning('*');
	};

	findById = async (id: string): Promise<IWishlist | null> => {
		return await knexDb.table('wishlists').where({ id }).first();
	};

	findByUniqueLink = async (uniqueLink: string): Promise<IWishlist | null> => {
		return await knexDb.table('wishlists').where({ uniqueLink }).first();
	};

	findByUserId = async (userId: string): Promise<IWishlist[]> => {
		return await knexDb.table('wishlists').where({ userId }).orderBy('created_at', 'desc');
	};

	update = async (id: string, payload: Partial<IWishlist>): Promise<IWishlist[]> => {
		return await knexDb('wishlists')
			.where({ id })
			.update({ ...payload, updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};

	incrementViewCount = async (id: string): Promise<IWishlist[]> => {
		return await knexDb('wishlists').where({ id }).increment('viewsCount', 1).returning('*');
	};

	updateContributionStats = async (id: string, amount: number): Promise<IWishlist[]> => {
		return await knexDb('wishlists')
			.where({ id })
			.increment('totalContributed', amount)
			.increment('contributorsCount', 1)
			.returning('*');
	};
}

export const wishlistRepository = new WishlistRepository();
