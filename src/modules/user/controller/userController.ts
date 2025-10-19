import { Request, Response } from 'express';
import {
	AppError,
	AppResponse,
	extractTokenFamily,
	generateReferralCode,
	generateTokenPair,
	generateUniqueUsername,
	getRefreshTokenFromRequest,
	invalidateTokenFamily,
	invalidateUserTokenFamilies,
	parseTokenDuration,
	sendLoginEmail,
	sendOtpEmail,
	sendOtpSms,
	sendWelcomeEmail,
	setCookie,
	toJSON,
} from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { friendsRepository, userRepository } from '@/modules/user/repository';
import { ENVIRONMENT } from '@/common/config';
import { IUser } from '@/common/interfaces';
import { DateTime } from 'luxon';

export class UserController {
	signUp = catchAsync(async (req: Request, res: Response) => {
		const { email, firstName, lastName, username, phone, gender, dob, referralCode } = req.body;

		if (!email && !phone) {
			throw new AppError('Either email or phone number is required', 400);
		}

		if (!gender) {
			throw new AppError('Gender is required', 400);
		}

		if (email) {
			const existingEmailUser = await userRepository.findByEmail(email);
			if (existingEmailUser) {
				throw new AppError('User with this email already exists', 409);
			}
		}

		if (phone) {
			const existingPhoneUser = await userRepository.findByPhone(phone);
			if (existingPhoneUser) {
				throw new AppError('User with this phone number already exists', 409);
			}
		}

		let finalUsername = username;
		if (username) {
			const existingUsernameUser = await userRepository.findByUsername(username);
			if (existingUsernameUser) {
				throw new AppError('User with this username already exists', 409);
			}
		} else {
			finalUsername = await generateUniqueUsername(lastName);
		}

		let referrer: IUser | null = null;
		if (referralCode) {
			referrer = await userRepository.findByReferralCode(referralCode);
			console.log(referrer);
			if (!referrer) {
				throw new AppError('Invalid referral code', 400);
			}
		}

		const isRegistrationComplete = !!(email && firstName && lastName && phone && dob && username);
		const referCode = generateReferralCode();

		const [user] = await userRepository.create({
			email,
			firstName,
			lastName,
			username: finalUsername,
			phone,
			gender,
			dob,
			ipAddress: req.ip,
			isRegistrationComplete,
			referralCode: referCode,
		});
		if (!user) {
			throw new AppError('Failed to create user', 500);
		}

		if (referralCode) {
			await friendsRepository.addFriendViaReferral(user.id, referralCode);
		}

		const currentRequestTime = DateTime.now();
		const lastOtpRetry = user.lastLogin
			? currentRequestTime.diff(DateTime.fromISO(user.lastLogin.toISOString()), 'hours')
			: null;

		if (user.otpRetries >= 5 && lastOtpRetry && Math.round(lastOtpRetry.hours) < 1) {
			throw new AppError('Too many OTP requests. Please try again in an hour.', 429);
		}

		// const generatedOtp = generateOtp();
		const generatedOtp = '222222';
		const otpExpires = currentRequestTime.plus({ minutes: 5 }).toJSDate();

		await userRepository.update(user.id, {
			otp: generatedOtp,
			otpExpires,
			otpRetries: (user.otpRetries || 0) + 1,
		});

		if (email && user.email) {
			await sendOtpEmail(user.email, user.firstName, generatedOtp);
			console.log(`OTP sent to email ${user.email}: ${generatedOtp}`);
		} else if (phone && user.phone) {
			const smsResult = await sendOtpSms(user.phone, generatedOtp, 'dnd');

			if (smsResult.success) {
				console.log(`OTP sent to phone ${user.phone}: ${generatedOtp}`);
			} else {
				// Log the error but don't fail registration
				console.error(`Failed to send OTP SMS to ${user.phone}:`, smsResult.error);
				// Optionally, you can still allow registration to proceed
				// or throw an error if SMS is critical
			}
		}

		await sendWelcomeEmail(user.email, user.firstName);

		return AppResponse(res, 201, toJSON([user]), 'User created successfully');
	});

	signIn = catchAsync(async (req: Request, res: Response) => {
		const { email, phone } = req.body;

		if (!email && !phone) {
			throw new AppError('Incomplete login data', 401);
		}

		let user: IUser | null = null;
		if (email) {
			user = await userRepository.findByEmail(email);
		} else if (phone) {
			user = await userRepository.findByPhone(phone);
		}

		if (!user) {
			throw new AppError('User not found', 404);
		}

		if (user.isSuspended) {
			throw new AppError('Your account is currently suspended', 401);
		}
		if (user.isDeleted) {
			throw new AppError('Account not found', 404);
		}

		const currentRequestTime = DateTime.now();
		const lastOtpRetry = user.lastLogin
			? currentRequestTime.diff(DateTime.fromISO(user.lastLogin.toISOString()), 'hours')
			: null;

		if (user.otpRetries >= 5 && lastOtpRetry && Math.round(lastOtpRetry.hours) < 1) {
			throw new AppError('Too many OTP requests. Please try again in an hour.', 429);
		}

		// const generatedOtp = generateOtp();
		const generatedOtp = '222222';
		const otpExpires = currentRequestTime.plus({ minutes: 5 }).toJSDate();

		await userRepository.update(user.id, {
			otp: generatedOtp,
			otpExpires,
			otpRetries: (user.otpRetries || 0) + 1,
		});

		if (email && user.email) {
			await sendOtpEmail(user.email, user.firstName, generatedOtp);
			console.log(`OTP sent to email ${user.email}: ${generatedOtp}`);
		} else if (phone && user.phone) {
			const smsResult = await sendOtpSms(user.phone, generatedOtp, 'dnd');

			if (!smsResult.success) {
				throw new AppError('Failed to send OTP via SMS. Please try again.', 500);
			}

			console.log(`OTP resent to phone ${user.phone}: ${generatedOtp}`);
		}

		return AppResponse(res, 200, toJSON([user]), 'Please request OTP to complete sign in.');
	});

	sendOtp = catchAsync(async (req: Request, res: Response) => {
		const { email, phone } = req.body;

		if (!email && !phone) {
			throw new AppError('Either email or phone number is required', 400);
		}

		let user: IUser | null = null;
		if (email) {
			user = await userRepository.findByEmail(email);
		} else if (phone) {
			user = await userRepository.findByPhone(phone);
		}

		if (!user) {
			throw new AppError('User not found', 404);
		}

		if (user.isSuspended) {
			throw new AppError('Your account is currently suspended', 401);
		}

		if (user.isDeleted) {
			throw new AppError('Account not found', 404);
		}

		const currentRequestTime = DateTime.now();
		const lastOtpRetry = user.lastLogin
			? currentRequestTime.diff(DateTime.fromISO(user.lastLogin.toISOString()), 'hours')
			: null;

		if (user.otpRetries >= 5 && lastOtpRetry && Math.round(lastOtpRetry.hours) < 1) {
			throw new AppError('Too many OTP requests. Please try again in an hour.', 429);
		}

		// const generatedOtp = generateOtp();
		const generatedOtp = '222222';
		const otpExpires = currentRequestTime.plus({ minutes: 5 }).toJSDate();

		await userRepository.update(user.id, {
			otp: generatedOtp,
			otpExpires,
			otpRetries: (user.otpRetries || 0) + 1,
		});

		if (email && user.email) {
			await sendOtpEmail(user.email, user.firstName, generatedOtp);
			console.log(`OTP sent to email ${user.email}: ${generatedOtp}`);
		} else if (phone && user.phone) {
			const smsResult = await sendOtpSms(user.phone, generatedOtp, 'dnd');

			if (!smsResult.success) {
				throw new AppError('Failed to send OTP via SMS. Please try again.', 500);
			}

			console.log(`OTP resent to phone ${user.phone}: ${generatedOtp}`);
		} else {
			throw new AppError('User does not have a valid contact method', 400);
		}

		return AppResponse(res, 200, null, `OTP sent. Please verify to continue.`);
	});

	verifyOtp = catchAsync(async (req: Request, res: Response) => {
		const { email, phone, otp } = req.body;

		if ((!email && !phone) || !otp) {
			throw new AppError('Email or phone number and OTP are required', 400);
		}

		let user: IUser | null = null;
		if (email) {
			user = await userRepository.findByEmail(email);
		} else if (phone) {
			user = await userRepository.findByPhone(phone);
		}

		if (!user) {
			throw new AppError('User not found', 404);
		}

		const currentRequestTime = DateTime.now();
		if (
			!user.otp ||
			!user.otpExpires ||
			user.otp !== otp ||
			DateTime.fromJSDate(user.otpExpires) < currentRequestTime
		) {
			throw new AppError('Invalid or expired OTP', 401);
		}

		await userRepository.update(user.id, {
			otp: '',
			otpExpires: currentRequestTime.toJSDate(),
			otpRetries: 0,
			lastLogin: currentRequestTime.toJSDate(),
		});

		const updatedUser = await userRepository.findById(user.id);
		if (!updatedUser) {
			throw new AppError('Failed to retrieve updated user', 500);
		}

		const loginTime = DateTime.now().toFormat("cccc, LLLL d, yyyy 'at' t");
		if (email && user.email && user.isRegistrationComplete) {
			await sendLoginEmail(user.email, user.firstName, loginTime);
		} else if (phone && user.phone) {
			//await sendLoginSms(user.phone, loginTime);
		}

		const { accessToken, refreshToken } = await generateTokenPair(user.id);

		setCookie(req, res, 'accessToken', accessToken, parseTokenDuration(ENVIRONMENT.JWT_EXPIRES_IN.ACCESS));
		setCookie(req, res, 'refreshToken', refreshToken, parseTokenDuration(ENVIRONMENT.JWT_EXPIRES_IN.REFRESH));

		return AppResponse(res, 200, toJSON([user]), 'OTP verified successfully');
	});

	updateUserDetails = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { email, firstName, lastName, dob, phone, username } = req.body;

		if (!user) {
			throw new AppError('User not found', 404);
		}

		const existingUser = await userRepository.findById(user.id);
		if (!existingUser) {
			throw new AppError('User not found', 404);
		}

		if (existingUser.isSuspended) {
			throw new AppError('Your account is currently suspended', 401);
		}
		if (existingUser.isDeleted) {
			throw new AppError('Account not found', 404);
		}

		if (email && email !== existingUser.email) {
			const existingEmailUser = await userRepository.findByEmail(email);
			if (existingEmailUser && existingEmailUser.id !== existingUser.id) {
				throw new AppError('User with this email already exists', 409);
			}
		}
		if (phone && phone !== existingUser.phone) {
			const existingPhoneUser = await userRepository.findByPhone(phone);
			if (existingPhoneUser && existingPhoneUser.id !== existingUser.id) {
				throw new AppError('User with this phone number already exists', 409);
			}
		}
		if (username && username !== existingUser.username) {
			const existingUsernameUser = await userRepository.findByUsername(username);
			if (existingUsernameUser && existingUsernameUser.id !== existingUser.id) {
				throw new AppError('User with this username already exists', 409);
			}
		}

		const updateData: Partial<IUser> = {};
		if (email !== undefined) updateData.email = email;
		if (firstName !== undefined) updateData.firstName = firstName;
		if (lastName !== undefined) updateData.lastName = lastName;
		if (dob !== undefined) updateData.dob = dob;
		if (phone !== undefined) updateData.phone = phone;
		if (username !== undefined) updateData.username = username;

		const updatedUser = { ...existingUser, ...updateData };
		const willBeComplete = !!(
			updatedUser.email &&
			updatedUser.firstName &&
			updatedUser.lastName &&
			updatedUser.phone &&
			updatedUser.dob &&
			updatedUser.username
		);

		if (willBeComplete) {
			updateData.isRegistrationComplete = true;
		}

		const updateUser = await userRepository.update(existingUser.id, updateData);
		if (!updateUser) {
			throw new AppError('Failed to update user details', 500);
		}

		const freshUser = await userRepository.findById(existingUser.id);
		if (!freshUser) {
			throw new AppError('Failed to retrieve updated user', 500);
		}

		return AppResponse(res, 200, toJSON([freshUser]), 'Profile updated successfully');
	});

	signOut = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('You are not logged in', 401);
		}

		const refreshToken = getRefreshTokenFromRequest(req);

		if (refreshToken) {
			const tokenFamily = extractTokenFamily(refreshToken);
			if (tokenFamily) {
				await invalidateTokenFamily(tokenFamily);
				console.log(`Invalidated token family: ${tokenFamily} for user: ${user.id}`);
			}
		}

		setCookie(req, res, 'accessToken', 'expired', -1);
		setCookie(req, res, 'refreshToken', 'expired', -1);

		AppResponse(res, 200, null, 'Logout successful');
	});

	signOutFromAllDevices = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('You are not logged in', 401);
		}

		//clearing the cookies set on the frontend by setting a new cookie with empty values and an expiry time in the past
		setCookie(req, res, 'accessToken', 'expired', -1);
		setCookie(req, res, 'refreshToken', 'expired', -1);

		await invalidateUserTokenFamilies(user.id);

		AppResponse(res, 200, null, 'Logout successful');
	});

	getProfile = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in again', 400);
		}

		const extinguishUser = await userRepository.findById(user.id);
		if (!extinguishUser) {
			throw new AppError('User not found', 404);
		}

		return AppResponse(res, 200, toJSON([extinguishUser]), 'Profile retrieved successfully');
	});

	partialFindByUsernameOrEmail = catchAsync(async (req: Request, res: Response) => {
		const { usernameOrEmail } = req.query;

		if (!usernameOrEmail) {
			throw new AppError('Please provide a username or email', 400);
		}

		const users = await userRepository.partialFindByUsernameOrEmail(usernameOrEmail as string);
		if (!users) {
			throw new AppError('No users found', 404);
		}

		return AppResponse(res, 200, toJSON(users), 'Users retrieved successfully');
	});
}

export const userController = new UserController();
