import { z } from 'zod';
import { Role } from '@/common/constants';

export const passwordRegexMessage =
	'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character or symbol';

export const passwordZ = z
	.string()
	.min(8, 'Password must have at least 8 characters!')
	.regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).*$/, { message: passwordRegexMessage });

export const nameZ = z.string().min(2).max(50).trim();
export const uuidZ = z.string().uuid();

export const roleEnum = z.enum([Role.Admin, Role.User, Role.SuperUser]);
