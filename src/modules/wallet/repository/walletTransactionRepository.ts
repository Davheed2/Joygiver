import { knexDb } from '@/common/config';
import { IWalletTransaction } from '@/common/interfaces';
import { walletRepository } from './walletRepository';

class WalletTransactionRepository {
	create = async (payload: Partial<IWalletTransaction>) => {
		return await knexDb.table('wallet_transactions').insert(payload).returning('*');
	};

	findById = async (id: string): Promise<IWalletTransaction | null> => {
		return await knexDb.table('wallet_transactions').where({ id }).first();
	};

	findByWalletId = async (walletId: string, page = 1, limit = 20): Promise<IWalletTransaction[]> => {
		const offset = (page - 1) * limit;
		return await knexDb
			.table('wallet_transactions')
			.where({ walletId })
			.orderBy('created_at', 'desc')
			.limit(limit)
			.offset(offset);
	};

	findByReference = async (reference: string): Promise<IWalletTransaction | null> => {
		return await knexDb.table('wallet_transactions').where({ reference }).first();
	};

	countByWalletId = async (walletId: string): Promise<number> => {
		const result = await knexDb('wallet_transactions')
			.where({ walletId })
			.count<{ count: string }[]>('* as count')
			.first();

		return Number(result?.count ?? 0);
	};

	getTransactionHistory = async (userId: string, page = 1, limit = 20) => {
		const wallet = await walletRepository.findByUserId(userId);
		if (!wallet) {
			throw new Error('Wallet not found');
		}

		const transactions = await walletTransactionRepository.findByWalletId(wallet.id, page, limit);
		const total = await walletTransactionRepository.countByWalletId(wallet.id);

		return {
			data: transactions,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	};
}

export const walletTransactionRepository = new WalletTransactionRepository();
