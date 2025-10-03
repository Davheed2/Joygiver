import { knexDb } from '@/common/config';
import { ITokenFamily } from '@/common/interfaces';
import { DateTime } from 'luxon';

class TokenFamilyRepository {
	create = async (payload: Partial<ITokenFamily>) => {
		return await knexDb.table('token_family').insert(payload).returning('*');
	};

	findActiveFamily = async (familyId: string): Promise<ITokenFamily | null> => {
		return await knexDb.table('token_family').where({ familyId }).first();
	};

	invalidateUserFamilies = async (userId: string): Promise<ITokenFamily[]> => {
		return await knexDb.table('token_family').where({ userId }).delete();
	};

	update = async (id: string, payload: Partial<ITokenFamily>): Promise<ITokenFamily[]> => {
		return await knexDb('token_family')
			.where({ id })
			.update({ ...payload, updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};

	invalidateFamily = async (familyId: string): Promise<void> => {
		await knexDb('token_family').where({ familyId }).delete();
	};
}

export const tokenFamilyRepository = new TokenFamilyRepository();
