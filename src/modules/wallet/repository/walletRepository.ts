import { knexDb } from '@/common/config';
import { IWallet } from '@/common/interfaces';
import { DateTime } from 'luxon';
import { payoutMethodRepository } from './payoutMethodRepository';

class WalletRepository {
	create = async (payload: Partial<IWallet>) => {
		return await knexDb.table('wallets').insert(payload).returning('*');
	};

	findById = async (id: string): Promise<IWallet | null> => {
		return await knexDb.table('wallets').where({ id }).first();
	};

	findByUserId = async (userId: string): Promise<IWallet | null> => {
		return await knexDb.table('wallets').where({ userId }).first();
	};

	update = async (id: string, payload: Partial<IWallet>): Promise<IWallet[]> => {
		return await knexDb('wallets')
			.where({ id })
			.update({ ...payload, updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};

	incrementAvailableBalance = async (id: string, amount: number): Promise<IWallet[]> => {
		return await knexDb('wallets')
			.where({ id })
			.increment('availableBalance', amount)
			.increment('totalReceived', amount)
			.update({ updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};

	decrementAvailableBalance = async (id: string, amount: number): Promise<IWallet[]> => {
		return await knexDb('wallets')
			.where({ id })
			.decrement('availableBalance', amount)
			.update({ updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};

	incrementPendingBalance = async (id: string, amount: number): Promise<IWallet[]> => {
		return await knexDb('wallets')
			.where({ id })
			.increment('pendingBalance', amount)
			.update({ updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};

	decrementPendingBalance = async (id: string, amount: number): Promise<IWallet[]> => {
		return await knexDb('wallets')
			.where({ id })
			.decrement('pendingBalance', amount)
			.update({ updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};

	movePendingToAvailable = async (id: string, amount: number): Promise<IWallet[]> => {
		return await knexDb('wallets')
			.where({ id })
			.decrement('pendingBalance', amount)
			.increment('availableBalance', amount)
			.update({ updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};

	creditWallet = async (userId: string, amount: number, reference: string, description: string): Promise<IWallet[]> => {
		const wallet = await this.findByUserId(userId);
		if (!wallet) {
			throw new Error('Wallet not found');
		}

		await knexDb.transaction(async (trx) => {
			// Add to pending balance first
			await trx('wallets')
				.where({ id: wallet.id })
				.increment('pendingBalance', amount)
				.update({ updated_at: new Date() });

			// Create transaction record
			await trx('wallet_transactions').insert({
				userId,
				walletId: wallet.id,
				type: 'contribution',
				amount,
				balanceBefore: wallet.availableBalance,
				balanceAfter: wallet.availableBalance,
				reference,
				description,
			});
		});

		return await this.findByUserId(userId).then((w) => (w ? [w] : []));
	};

	confirmPendingBalance = async (userId: string, amount: number, reference: string): Promise<IWallet[]> => {
		const wallet = await this.findByUserId(userId);
		if (!wallet) {
			throw new Error('Wallet not found');
		}

		await knexDb.transaction(async (trx) => {
			const balanceBefore = wallet.availableBalance;

			await trx('wallets')
				.where({ id: wallet.id })
				.decrement('pendingBalance', amount)
				.increment('availableBalance', amount)
				.increment('totalReceived', amount)
				.update({ updated_at: new Date() });

			// Update transaction record
			await trx('wallet_transactions')
				.where({ reference })
				.update({
					balanceAfter: balanceBefore + amount,
					updated_at: new Date(),
				});
		});

		return await this.findByUserId(userId).then((w) => (w ? [w] : []));
	};

	getWalletSummary = async (userId: string) => {
		const wallet = await this.findByUserId(userId);
		const payoutMethods = await payoutMethodRepository.findByUserId(userId);

		// Get contributors count (distinct contributors from contributions)
		const contributorsResult = await knexDb('contributions')
			.where({ receiverId: userId })
			.countDistinct('contributorEmail as count')
			.first();

		// Get wishlist items count
		const wishlistItemsResult = await knexDb('wishlist_items as wi')
			.join('wishlists as w', 'wi.wishlistId', 'w.id')
			.where('w.userId', userId)
			.count('* as count')
			.first();

		return {
			wallet,
			payoutMethods,
			contributorsCount: Number(contributorsResult?.count || 0),
			wishlistItemsCount: Number(wishlistItemsResult?.count || 0),
		};
	};
}

export const walletRepository = new WalletRepository();
