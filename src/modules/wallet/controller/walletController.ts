import { Request, Response } from 'express';
import { AppError, AppResponse, toJSON } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { walletRepository, walletTransactionRepository } from '../repository';
import { IWallet } from '@/common/interfaces';

export class WalletController {
	getUserWallet = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in to create a wallet', 401);
		}

		let wallet: IWallet | null;
		wallet = await walletRepository.findByUserId(user.id);
		if (!wallet) {
			[wallet] = await walletRepository.create({
				userId: user.id,
				availableBalance: 0,
				pendingBalance: 0,
				totalReceived: 0,
				totalWithdrawn: 0,
			});
		}

		return AppResponse(res, 201, toJSON([wallet]), 'Wallet created successfully');
	});

	getWalletSummary = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in to view your wallet', 401);
		}

		const summary = await walletRepository.getWalletSummary(user.id);
		if (!summary) {
			throw new AppError('Wallet summary not found', 404);
		}

		return AppResponse(res, 200, toJSON([summary]), 'Wallet summary retrieved successfully');
	});

	getTransactionHistory = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { page = 1, limit = 20 } = req.query;

		const pageNum = parseInt(page as string, 10);
		const limitNum = parseInt(limit as string, 10);

		if (!user) {
			throw new AppError('Please log in to view transaction history', 401);
		}

		const history = await walletTransactionRepository.getTransactionHistory(user.id, pageNum, limitNum);
		if (!history) {
			throw new AppError('Transaction history not found', 404);
		}

		return AppResponse(res, 200, toJSON([history]), 'Transaction history retrieved successfully');
	});
}

export const walletController = new WalletController();
