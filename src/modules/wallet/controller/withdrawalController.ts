import { Request, Response } from 'express';
import { AppError, AppResponse, toJSON } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { withdrawalRequestRepository } from '../repository';
import { IWithdrawalRequest } from '@/common/interfaces';

export class WithdrawalController {
	createWithdrawal = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { amount, payoutMethodId } = req.body;

		if (!user) {
			throw new AppError('Please log in to withdraw funds', 401);
		}

		if (!amount || amount <= 0) {
			throw new AppError('Invalid withdrawal amount', 400);
		}

		// Create withdrawal request
		const withdrawal = await withdrawalRequestRepository.createWithdrawalRequest(
			user.id,
			Number(amount),
			payoutMethodId
		);

		const withdrawRequest = await withdrawalRequestRepository.processWithdrawal(withdrawal.id);
		console.log('Withdrawal request processed:', withdrawRequest);

		return AppResponse(res, 201, toJSON([withdrawal]), 'Withdrawal request created successfully');
	});

	getWithdrawalHistory = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { page = 1, limit = 20 } = req.query;

		if (!user) {
			throw new AppError('Please log in to view withdrawal history', 401);
		}

		const pageNum = parseInt(page as string, 10);
		const limitNum = parseInt(limit as string, 10);

		const history = await withdrawalRequestRepository.getWithdrawalHistory(user.id, pageNum, limitNum);

		return AppResponse(res, 200, toJSON([history]), 'Withdrawal history retrieved successfully');
	});

	getWithdrawalDetails = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { withdrawalId } = req.query;

		if (!user) {
			throw new AppError('Please log in', 401);
		}

		if (!withdrawalId) {
			throw new AppError('Withdrawal ID is required', 400);
		}

		// Get all withdrawals and find the specific one (ensures user owns it)
		const withdrawals = await withdrawalRequestRepository.getWithdrawalHistory(user.id, 1, 1000);
		const withdrawal = withdrawals.withdrawals.find((w: IWithdrawalRequest) => w.id === withdrawalId);

		if (!withdrawal) {
			throw new AppError('Withdrawal not found', 404);
		}

		return AppResponse(res, 200, toJSON([withdrawal]), 'Withdrawal details retrieved successfully');
	});

	cancelWithdrawal = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { withdrawalId } = req.body;

		if (!user) {
			throw new AppError('Please log in', 401);
		}

		if (!withdrawalId) {
			throw new AppError('Withdrawal ID is required', 400);
		}

		await withdrawalRequestRepository.failWithdrawal(withdrawalId as string, 'Cancelled by user');

		return AppResponse(res, 200, null, 'Withdrawal cancelled successfully');
	});

	// ==================== ADMIN ENDPOINTS ====================
	processWithdrawal = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { withdrawalId } = req.body;

		if (!user || user.role !== 'admin') {
			throw new AppError('Unauthorized. Admin access required', 403);
		}

		if (!withdrawalId) {
			throw new AppError('Withdrawal ID is required', 400);
		}

		await withdrawalRequestRepository.processWithdrawal(withdrawalId);

		return AppResponse(res, 200, null, 'Withdrawal processed successfully');
	});

	completeWithdrawal = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { withdrawalId } = req.body;

		if (!user || user.role !== 'admin') {
			throw new AppError('Unauthorized. Admin access required', 403);
		}

		if (!withdrawalId) {
			throw new AppError('Withdrawal ID is required', 400);
		}

		await withdrawalRequestRepository.completeWithdrawal(withdrawalId);

		return AppResponse(res, 200, null, 'Withdrawal completed successfully');
	});

	failWithdrawal = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { reason, withdrawalId } = req.body;

		if (!user || user.role !== 'admin') {
			throw new AppError('Unauthorized. Admin access required', 403);
		}

		if (!withdrawalId) {
			throw new AppError('Withdrawal ID is required', 400);
		}

		if (!reason) {
			throw new AppError('Failure reason is required', 400);
		}

		await withdrawalRequestRepository.failWithdrawal(withdrawalId, reason);

		return AppResponse(res, 200, null, 'Withdrawal marked as failed and balance refunded');
	});

	getPendingWithdrawals = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user || user.role !== 'admin') {
			throw new AppError('Unauthorized. Admin access required', 403);
		}

		const pendingWithdrawals = await withdrawalRequestRepository.findPending();
		if (!pendingWithdrawals) {
			throw new AppError('Failed to retrieve pending withdrawals', 500);
		}

		return AppResponse(res, 200, toJSON(pendingWithdrawals), 'Pending withdrawals retrieved successfully');
	});
}

export const withdrawalController = new WithdrawalController();
