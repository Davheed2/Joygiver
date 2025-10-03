import { ENVIRONMENT } from '@/common/config';
import { authenticate, isMobile, parseTokenDuration, setCookie } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import type { NextFunction, Request, Response } from 'express';

export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const accessToken = req.cookies?.accessToken || req.headers['authorization']?.split(' ')[1];
	const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token'];
	const isMobileDevice = isMobile(req);

	const {
		currentUser,
		accessToken: newAccessToken,
		newRefreshToken,
		tokenRotated,
	} = await authenticate({
		accessToken,
		refreshToken,
		isMobileDevice,
	});

	if (newAccessToken) {
		setCookie(req, res, 'accessToken', newAccessToken, parseTokenDuration(ENVIRONMENT.JWT_EXPIRES_IN.ACCESS));
	}

	if (tokenRotated && newRefreshToken) {
		// Set refresh token via setCookie (handles mobile vs browser logic)
		setCookie(req, res, 'refreshToken', newRefreshToken, parseTokenDuration(ENVIRONMENT.JWT_EXPIRES_IN.REFRESH));
	}

	// attach the user to the request object
	req.user = currentUser;

	next();
});
