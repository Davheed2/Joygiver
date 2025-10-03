/**
 * App wide constants go here
 *
 * e.g
 * export const APP_NAME = 'MyApp';
 */
export enum Role {
	SuperUser = 'superuser',
	User = 'user',
	Admin = 'admin',
}

export enum AuthProvider {
	Local = 'local',
	Google = 'google',
	Facebook = 'facebook',
}