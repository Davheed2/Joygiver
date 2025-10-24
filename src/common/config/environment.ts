import type { IEnvironment } from '@/common/interfaces';

export const ENVIRONMENT: IEnvironment = {
	APP: {
		NAME: process.env.APP_NAME,
		PORT: parseInt(process.env.PORT || process.env.APP_PORT || '3000'),
		ENV: process.env.NODE_ENV,
		CLIENT: process.env.FRONTEND_URL!,
	},
	DB: {
		HOST: process.env.DB_HOST!,
		USER: process.env.DB_USER!,
		PASSWORD: process.env.DB_PASSWORD!,
		DATABASE: process.env.DB_DATABASE!,
		PORT: process.env.DB_PORT!,
	},
	JWT: {
		AUTH_SECRET: process.env.AUTH_SECRET!,
		ACCESS_SECRET: process.env.ACCESS_TOKEN!,
		REFRESH_SECRET: process.env.REFRESH_TOKEN!,
	},
	JWT_EXPIRES_IN: {
		ACCESS: process.env.ACCESS_TOKEN_EXPIRES_IN!,
		REFRESH: process.env.REFRESH_TOKEN_EXPIRES_IN!,
	},
	EMAIL: {
		GMAIL_USER: process.env.GMAIL_USER!,
		GMAIL_PASSWORD: process.env.GMAIL_PASSWORD!,
		RESEND_API_KEY: process.env.RESEND_API_KEY!,
	},
	FRONTEND_URL: process.env.FRONTEND_URL!,
	R2: {
		ACCOUNT_ID: process.env.R2_ACCOUNT_ID!,
		REGION: process.env.R2_REGION || 'auto',
		ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID!,
		SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY!,
		BUCKET_NAME: process.env.R2_BUCKET_NAME!,
		CDN_URL: process.env.R2_CDN_URL!,
		PUBLIC_URL: process.env.R2_PUBLIC_URL!,
	},
	REDIS: {
		URL: process.env.QUEUE_REDIS_URL!,
		PASSWORD: process.env.QUEUE_REDIS_PASSWORD!,
		PORT: parseInt(process.env.QUEUE_REDIS_PORT!),
	},
	GOOGLE: {
		CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
		CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
		REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI!,
	},
	PAYSTACK: {
		SECRET_KEY: process.env.PAYSTACK_SECRET_KEY!,
		PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY!,
	},
	TERMII: {
		API_KEY: process.env.TERMII_API_KEY!,
		SENDER_ID: process.env.TERMII_SENDER_ID!,
	},
	FIREBASE: {
		SERVICE_ACCOUNT_KEY: process.env.FIREBASE_SERVICE_ACCOUNT_KEY!,
	}
};
