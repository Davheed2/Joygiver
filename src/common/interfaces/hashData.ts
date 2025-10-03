export interface IHashData {
	id?: string;
	token?: string;
	type?: 'access' | 'refresh' | 'otp' | 'passwordReset';
	tokenFamily?: string;
	version?: number;
}
