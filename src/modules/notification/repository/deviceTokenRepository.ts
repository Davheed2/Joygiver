import { knexDb } from '@/common/config';
import { IDeviceToken, ICreateDeviceToken, IUpdateDeviceToken } from '@/common/interfaces';

class DeviceTokenRepository {
	private readonly tableName = 'device_tokens';
	upsert = async (payload: ICreateDeviceToken): Promise<IDeviceToken> => {
		const existingToken = await this.findByToken(payload.token);

		if (existingToken) {
			const [updated] = await knexDb(this.tableName)
				.where({ token: payload.token })
				.update({
					userId: payload.userId, 
					platform: payload.platform,
					deviceId: payload.deviceId,
					isActive: true,
					lastUsedAt: knexDb.fn.now(),
					updated_at: knexDb.fn.now(),
				})
				.returning('*');
			return updated;
		} else {
			const [created] = await knexDb(this.tableName)
				.insert({
					...payload,
					isActive: true,
					lastUsedAt: knexDb.fn.now(),
				})
				.returning('*');
			return created;
		}
	};

	/**
	 * Find a device token by token string
	 */
	findByToken = async (token: string): Promise<IDeviceToken | null> => {
		return await knexDb(this.tableName).where({ token }).first();
	};

	/**
	 * Find a device token by ID
	 */
	findById = async (id: string): Promise<IDeviceToken | null> => {
		return await knexDb(this.tableName).where({ id }).first();
	};

	/**
	 * Get all active tokens for a user
	 */
	findActiveByUserId = async (userId: string): Promise<IDeviceToken[]> => {
		return await knexDb(this.tableName).where({ userId, isActive: true }).orderBy('lastUsedAt', 'desc');
	};

	/**
	 * Get all active tokens for multiple users
	 */
	findActiveByUserIds = async (userIds: string[]): Promise<IDeviceToken[]> => {
		return await knexDb(this.tableName)
			.whereIn('userId', userIds)
			.where({ isActive: true })
			.orderBy('lastUsedAt', 'desc');
	};

	/**
	 * Get token strings only (for sending notifications)
	 */
	getActiveTokenStrings = async (userId: string): Promise<string[]> => {
		const tokens = await knexDb(this.tableName).where({ userId, isActive: true }).select('token');

		return tokens.map((t) => t.token);
	};

	/**
	 * Get token strings for multiple users
	 */
	getActiveTokenStringsByUserIds = async (userIds: string[]): Promise<Map<string, string[]>> => {
		const tokens = await knexDb(this.tableName)
			.whereIn('userId', userIds)
			.where({ isActive: true })
			.select('userId', 'token');

		// Group tokens by userId
		const tokenMap = new Map<string, string[]>();
		tokens.forEach((t) => {
			const existing = tokenMap.get(t.userId) || [];
			existing.push(t.token);
			tokenMap.set(t.userId, existing);
		});

		return tokenMap;
	};

	/**
	 * Update a device token
	 */
	update = async (id: string, payload: IUpdateDeviceToken): Promise<IDeviceToken | null> => {
		const [updated] = await knexDb(this.tableName)
			.where({ id })
			.update({
				...payload,
				updated_at: knexDb.fn.now(),
			})
			.returning('*');

		return updated || null;
	};

	/**
	 * Update token by token string
	 */
	updateByToken = async (token: string, payload: IUpdateDeviceToken): Promise<IDeviceToken | null> => {
		const [updated] = await knexDb(this.tableName)
			.where({ token })
			.update({
				...payload,
				updated_at: knexDb.fn.now(),
			})
			.returning('*');

		return updated || null;
	};

	/**
	 * Deactivate a token (mark as inactive)
	 */
	deactivate = async (token: string): Promise<void> => {
		await knexDb(this.tableName).where({ token }).update({
			isActive: false,
			updated_at: knexDb.fn.now(),
		});
	};

	/**
	 * Deactivate multiple tokens
	 */
	deactivateMultiple = async (tokens: string[]): Promise<void> => {
		if (tokens.length === 0) return;

		await knexDb(this.tableName).whereIn('token', tokens).update({
			isActive: false,
			updated_at: knexDb.fn.now(),
		});
	};

	/**
	 * Delete a token (permanent removal)
	 */
	delete = async (token: string): Promise<void> => {
		await knexDb(this.tableName).where({ token }).delete();
	};

	/**
	 * Delete all tokens for a user (when user deletes account)
	 */
	deleteByUserId = async (userId: string): Promise<void> => {
		await knexDb(this.tableName).where({ userId }).delete();
	};

	/**
	 * Update last used timestamp
	 */
	updateLastUsed = async (token: string): Promise<void> => {
		await knexDb(this.tableName).where({ token }).update({
			lastUsedAt: knexDb.fn.now(),
			updated_at: knexDb.fn.now(),
		});
	};

	/**
	 * Clean up old inactive tokens
	 * @param daysOld - Number of days to consider a token old (default 30)
	 */
	cleanupInactiveTokens = async (daysOld: number = 30): Promise<number> => {
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - daysOld);

		const deleted = await knexDb(this.tableName)
			.where({ isActive: false })
			.where('updated_at', '<', cutoffDate)
			.delete();

		return deleted;
	};

	/**
	 * Count active tokens for a user
	 */
	countActiveByUserId = async (userId: string): Promise<number> => {
		const result = await knexDb(this.tableName)
			.where({ userId, isActive: true })
			.count<{ count: string }[]>('* as count')
			.first();

		return Number(result?.count ?? 0);
	};

	/**
	 * Get device statistics for a user
	 */
	getUserDeviceStats = async (
		userId: string
	): Promise<{
		totalDevices: number;
		activeDevices: number;
		iosDevices: number;
		androidDevices: number;
	}> => {
		const stats = await knexDb(this.tableName)
			.where({ userId })
			.select(
				knexDb.raw('COUNT(*) as "totalDevices"'),
				knexDb.raw('COUNT(*) FILTER (WHERE "isActive" = true) as "activeDevices"'),
				knexDb.raw('COUNT(*) FILTER (WHERE platform = ?) as "iosDevices"', ['ios']),
				knexDb.raw('COUNT(*) FILTER (WHERE platform = ?) as "androidDevices"', ['android'])
			)
			.first();

		return {
			totalDevices: Number(stats?.totalDevices ?? 0),
			activeDevices: Number(stats?.activeDevices ?? 0),
			iosDevices: Number(stats?.iosDevices ?? 0),
			androidDevices: Number(stats?.androidDevices ?? 0),
		};
	};
}

export const deviceTokenRepository = new DeviceTokenRepository();
