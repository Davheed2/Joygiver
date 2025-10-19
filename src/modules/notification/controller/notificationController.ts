import { Request, Response } from 'express';
import { AppError, AppResponse, toJSON } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { notificationService } from '@/services/notification';

class NotificationController {
	notifyUser = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { title, body, data, userId } = req.body;

		if (!user) {
			throw new AppError('Unauthorized', 401);
		}
		if (!title || !body) {
			throw new AppError('Title and body are required', 400);
		}
		if (!userId) {
			throw new AppError('userId is required', 400);
		}
		if (user.role !== 'admin') {
			throw new AppError('Forbidden: Admins only', 403);
		}

		const result = await notificationService.sendCustomNotification(userId, title, body, data || {});

		return AppResponse(res, 200, toJSON([result]), 'Notification sent successfully');
	});

	notifyMultipleUsers = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { userIds, title, body, data } = req.body;

		if (!user) {
			throw new AppError('Unauthorized', 401);
		}
		if (user.role !== 'admin') {
			throw new AppError('Forbidden: Admins only', 403);
		}

		if (!Array.isArray(userIds) || userIds.length === 0) {
			throw new AppError('userIds array is required', 400);
		}

		if (!title || !body) {
			throw new AppError('Title and body are required', 400);
		}

		const notification = { title, body };
		const result = await notificationService.notifyMultipleUsers(userIds, notification, data || {});

		return AppResponse(res, 200, toJSON([result]), 'Notification sent successfully');
	});
}

export const notificationController = new NotificationController();
