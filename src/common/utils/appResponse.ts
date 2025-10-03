import { Response } from 'express';

export const AppResponse = (
	res: Response,
	statusCode: number = 200,
	data: Record<string, string[]> | unknown | string | null,
	message: string
) => {
	const newTokens: { newAccessToken?: string; newRefreshToken?: string } = {};

	if (res.locals.newAccessToken) {
		newTokens.newAccessToken = res.locals.newAccessToken;
	}
	if (res.locals.newRefreshToken) {
		newTokens.newRefreshToken = res.locals.newRefreshToken;
	}

	res.status(statusCode).json({
		status: 'success',
		data: data ?? null,
		...(newTokens?.newAccessToken && newTokens),
		message: message ?? 'Success',
	});
};

// export const AppResponse = (
// 	res: Response,
// 	statusCode: number = 200,
// 	data: Record<string, string[]> | unknown | string | null,
// 	message: string
// ) => {
// 	const responseBody: {
// 		status: string;
// 		data: any;
// 		message: string;
// 		newAccessToken?: string;
// 		newRefreshToken?: string;
// 		tokenRotated?: boolean;
// 	} = {
// 		status: 'success',
// 		data: data ?? null,
// 		message: message ?? 'Success',
// 	};

// 	// Add tokens if they exist in res.locals (for mobile clients)
// 	if (res.locals.newAccessToken) {
// 		responseBody.newAccessToken = res.locals.newAccessToken;
// 	}

// 	if (res.locals.newRefreshToken) {
// 		responseBody.newRefreshToken = res.locals.newRefreshToken;
// 		responseBody.tokenRotated = true;
// 	}

// 	res.status(statusCode).json(responseBody);
// };
