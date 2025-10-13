import { knexDb } from '@/common/config';
import { IWallet, IWalletTransaction } from '@/common/interfaces';
import { walletRepository } from './walletRepository';
import { AppError } from '@/common/utils';

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
