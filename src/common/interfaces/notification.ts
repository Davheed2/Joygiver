export interface ServiceAccountJSON {
	project_id?: string;
	projectId?: string;
	private_key?: string;
	privateKey?: string;
	client_email?: string;
	clientEmail?: string;
	private_key_id?: string;
	privateKeyId?: string;
	client_id?: string;
	clientId?: string;
	[key: string]: unknown;
}

export interface NotificationPayload {
	title: string;
	body: string;
	image?: string;
}

export interface DataPayload {
	[key: string]: string; // FCM data must be string key-value pairs
}

export interface SendResult {
	success: boolean;
	messageId?: string;
	error?: string;
	successCount?: number;
	failedTokens?: string[];
}

export interface SendNotificationResult {
	success: boolean;
	successCount: number;
	failureCount: number;
	failedTokens: string[];
	error?: string;
}

export interface SendNotificationRequest {
	deviceToken: string;
	title: string;
	body: string;
	data?: DataPayload;
}

export interface SendBatchNotificationRequest {
	deviceTokens: string[];
	title: string;
	body: string;
	data?: DataPayload;
}

export interface IDeviceToken {
	id: string;
	userId: string;
	token: string;
	platform: 'ios' | 'android';
	deviceId?: string | null;
	isActive: boolean;
	lastUsedAt: Date;
	created_at: Date;
	updated_at: Date;
}

export interface ICreateDeviceToken {
	userId: string;
	token: string;
	platform: 'ios' | 'android';
	deviceId?: string;
}

export interface IUpdateDeviceToken {
	isActive?: boolean;
	lastUsedAt?: Date;
	deviceId?: string;
}
