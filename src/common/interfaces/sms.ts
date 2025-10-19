export interface ITermiiSendSmsPayload {
	to: string;
	from: string;
	sms: string;
	type: 'plain' | 'unicode';
	channel: 'generic' | 'dnd' | 'whatsapp';
	api_key: string;
}

export interface ITermiiSendSmsResponse {
	message_id: string;
	message: string;
	balance: number;
	user: string;
}

export interface ITermiiErrorResponse {
	message: string;
	error?: string;
}

export interface ISendSmsOptions {
	phone: string;
	message: string;
	channel?: 'generic' | 'dnd' | 'whatsapp';
	type?: 'plain' | 'unicode';
}

export interface ISendOtpOptions {
	phone: string;
	otp: string;
	channel?: 'generic' | 'dnd' | 'whatsapp';
}

export interface ISmsResult {
	success: boolean;
	messageId?: string;
	message?: string;
	balance?: number;
	error?: string;
}
