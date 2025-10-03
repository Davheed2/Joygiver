import { IUser } from '../interfaces';
import jwt from 'jsonwebtoken';

export type AuthenticateResult = {
	currentUser: IUser;
	accessToken?: string;
};

export type EnhancedAuthenticateResult = AuthenticateResult & {
	newRefreshToken?: string;
	tokenRotated?: boolean;
};

export type RefreshTokenPayload = jwt.JwtPayload & {
	id: string;
	tokenFamily: string;
	version: number;
	type: 'refresh';
};
