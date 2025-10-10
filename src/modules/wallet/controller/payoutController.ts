import { Request, Response } from 'express';
import { AppError, AppResponse, toJSON } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { payoutMethodRepository } from '../repository';
import { paystackService } from '../services';

export class PayoutController {
	getBanks = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
        const {search} = req.query;

		if (!user) {
			throw new AppError('Please log in to view banks', 401);
		}

		const banks = await paystackService.getBanks(search as string);
		if (!banks) {
			throw new AppError('Failed to retrieve banks', 500);
		}

		return AppResponse(res, 200, toJSON(banks), 'Banks retrieved successfully');
	});

	verifyAccountNumber = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { accountNumber, bankCode } = req.body;

		if (!user) {
			throw new AppError('Please log in to verify account', 401);
		}
		if (!accountNumber || !bankCode) {
			throw new AppError('Account number and bank code are required', 400);
		}

		const verification = await paystackService.verifyAccountNumber(accountNumber, bankCode);
		if (!verification) {
			throw new AppError('Account verification failed', 400);
		}

		return AppResponse(res, 200, toJSON([verification]), 'Account verified successfully');
	});

	addPayoutMethod = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { accountNumber, bankCode, isPrimary } = req.body;

		if (!user) {
			throw new AppError('Please log in to add a payout method', 401);
		}

		if (!accountNumber || !bankCode) {
			throw new AppError('Account number and bank code are required', 400);
		}

		const payoutMethod = await payoutMethodRepository.addPayoutMethod(
			user.id,
			accountNumber,
			bankCode,
			isPrimary || false
		);

		return AppResponse(res, 201, toJSON([payoutMethod]), 'Payout method added successfully');
	});

	getPayoutMethods = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in to view payout methods', 401);
		}

		const payoutMethods = await payoutMethodRepository.getPayoutMethods(user.id);

		return AppResponse(res, 200, toJSON(payoutMethods), 'Payout methods retrieved successfully');
	});

	setPrimaryPayoutMethod = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { payoutMethodId } = req.body;

		if (!user) {
			throw new AppError('Please log in', 401);
		}

		if (!payoutMethodId) {
			throw new AppError('Payout method ID is required', 400);
		}

		const payoutMethod = await payoutMethodRepository.setPrimaryPayoutMethod(user.id, payoutMethodId as string);

		return AppResponse(res, 200, toJSON([payoutMethod]), 'Primary payout method updated successfully');
	});

	deletePayoutMethod = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { payoutMethodId } = req.body;

		if (!user) {
			throw new AppError('Please log in', 401);
		}

		if (!payoutMethodId) {
			throw new AppError('Payout method ID is required', 400);
		}

		await payoutMethodRepository.deletePayoutMethod(user.id, payoutMethodId as string);

		return AppResponse(res, 200, null, 'Payout method deleted successfully');
	});
}

export const payoutController = new PayoutController();
