import { Request, Response } from 'express';
import { AppError, AppResponse, toJSON } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { deviceTokenRepository } from '../repository';

class DeviceTokenController {
	saveToken = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { token, platform, deviceId } = req.body;

		if (!user) {
			throw new AppError('Unauthorized', 401);
		}

		if (!token || !platform) {
			throw new AppError('Token and platform are required', 400);
		}

		if (!['ios', 'android'].includes(platform)) {
			throw new AppError('Platform must be either "ios" or "android"', 400);
		}

		const deviceToken = await deviceTokenRepository.upsert({
			userId: user.id,
			token,
			platform,
			deviceId,
		});

		return AppResponse(
			res,
			201,
			toJSON([
				{
					id: deviceToken.id,
					platform: deviceToken.platform,
					isActive: deviceToken.isActive,
				},
			]),
			'Device token saved successfully'
		);
	});

	getUserDevices = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Unauthorized', 401);
		}

		const devices = await deviceTokenRepository.findActiveByUserId(user.id);
		const stats = await deviceTokenRepository.getUserDeviceStats(user.id);

		return AppResponse(
			res,
			200,
			toJSON([
				{
					devices: devices.map((d) => ({
						id: d.id,
						platform: d.platform,
						deviceId: d.deviceId,
						isActive: d.isActive,
						lastUsedAt: d.lastUsedAt,
						createdAt: d.created_at,
					})),
					stats,
				},
			]),
			'User devices retrieved successfully'
		);
	});

	deleteToken = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { token } = req.body;

		if (!user) {
			throw new AppError('Unauthorized', 401);
		}

		if (!token) {
			throw new AppError('Token is required', 400);
		}

		const deviceToken = await deviceTokenRepository.findByToken(token);
		if (!deviceToken) {
			throw new AppError('Token not found', 404);
		}

		if (deviceToken.userId !== user.id) {
			throw new AppError('Unauthorized to delete this token', 403);
		}

		await deviceTokenRepository.delete(token);

		return AppResponse(res, 200, null, 'Device token deleted successfully');
	});

	deactivateToken = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { token } = req.body;

		if (!user) {
			throw new AppError('Unauthorized', 401);
		}

		if (!token) {
			throw new AppError('Token is required', 400);
		}

		const deviceToken = await deviceTokenRepository.findByToken(token);
		if (!deviceToken) {
			throw new AppError('Token not found', 404);
		}
		if (deviceToken.userId !== user.id) {
			throw new AppError('Unauthorized to deactivate this token', 403);
		}

		await deviceTokenRepository.deactivate(token);

		return AppResponse(res, 200, null, 'Device token deactivated successfully');
	});

	cleanupTokens = catchAsync(async (req: Request, res: Response) => {
		const { daysOld = 30 } = req.body;

		const deletedCount = await deviceTokenRepository.cleanupInactiveTokens(daysOld);

		return AppResponse(
			res,
			200,
			{
				deletedCount,
				daysOld,
			},
			`Cleaned up ${deletedCount} inactive tokens`
		);
	});
}

export const deviceTokenController = new DeviceTokenController();
