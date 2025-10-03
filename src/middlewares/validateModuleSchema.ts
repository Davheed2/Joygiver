import { Request, Response, NextFunction } from 'express';
import { moduleSchemaMap } from '@/schemas/modulesIndex';
import { AppError } from '@/common/utils';
import { catchAsync } from './catchAsyncErrors';

// Methods and routes to skip validation
const methodsToSkipValidation = ['GET'];
const routesToSkipValidation = ['/api/v1/auth/sign-in'];

export const validateModuleSchema = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	// 1. Skip validation for certain methods or routes
	if (methodsToSkipValidation.includes(req.method) || routesToSkipValidation.includes(req.url)) {
		return next();
	}

	const url = req.baseUrl || req.originalUrl || req.url;

	// 2. Find longest matching prefix
	const matches = Object.keys(moduleSchemaMap)
		.filter((prefix) => url.startsWith(prefix))
		.sort((a, b) => b.length - a.length);

	if (!matches.length) return next(); // no schema registered → skip

	const schema = moduleSchemaMap[matches[0]];

	if (!req.body || Object.keys(req.body).length === 0) return next();

	// 3. Use partial schema for PATCH/PUT
	const parseSchema = req.method === 'PATCH' || req.method === 'PUT' ? schema.partial() : schema;

	// 4. Validate
	const result = parseSchema.safeParse(req.body);

	if (!result.success) {
		// convert Zod errors into AppError-friendly format
		const errorDetails = result.error.errors[0].message;
		throw new AppError('Validation failed', 422, errorDetails);
	}

	// 5. Attach sanitized data to req.body
	req.body = result.data;

	next();
});
