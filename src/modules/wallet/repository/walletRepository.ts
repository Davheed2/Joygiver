import { knexDb } from '@/common/config';
import { IWallet } from '@/common/interfaces';
import { DateTime } from 'luxon';
import { payoutMethodRepository } from './payoutMethodRepository';
import { AppError } from '@/common/utils';

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

		const availableBalance = Number(wallet.availableBalance);
		// const pendingBalance = Number(wallet.pendingBalance || 0);

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
				balanceBefore: availableBalance,
				balanceAfter: availableBalance,
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
			const balanceAfter = Number(balanceBefore) + Number(amount);

			await trx('wallets')
				.where({ id: wallet.id })
				.decrement('pendingBalance', amount)
				.increment('availableBalance', amount)
				.increment('totalReceived', amount)
				.update({ updated_at: new Date() });

			// Update transaction record
			await trx('wallet_transactions').where({ reference }).update({
				balanceAfter,
				updated_at: new Date(),
			});
		});

		return await this.findByUserId(userId).then((w) => (w ? [w] : []));
	};

	getWalletSummary = async (userId: string) => {
		let wallet: IWallet | null;
		wallet = await walletRepository.findByUserId(userId);
		if (!wallet) {
			[wallet] = await walletRepository.create({
				userId,
				availableBalance: 0,
				pendingBalance: 0,
				totalReceived: 0,
				totalWithdrawn: 0,
			});
		}
		if (!wallet) {
			throw new AppError('Wallet not found', 404);
		}

		const payoutMethods = await payoutMethodRepository.findByUserId(userId);

		// Get contributors count (distinct contributors from all user's wishlists)
		const contributorsResult = await knexDb('contributions as c')
			.join('wishlists as w', 'c.wishlistId', 'w.id')
			.where('w.userId', userId)
			.where('c.status', 'completed')
			.countDistinct('c.contributorEmail as count')
			.first();

		// Get wishlist items count (from all user's wishlists)
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
