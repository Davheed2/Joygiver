import { knexDb } from '@/common/config';
import { ContributionStatus } from '@/common/constants';
import { IContribution } from '@/common/interfaces';
import { DateTime } from 'luxon';

class ContributorsRepository {
	create = async (payload: Partial<IContribution>) => {
		return await knexDb.table('contributions').insert(payload).returning('*');
	};

	findTopContributors = async (wishlistId: string, limit: number, offset: number): Promise<IContribution[]> => {
		return await knexDb
			.table('contributions')
			.select(
				'contributorName',
				knexDb.raw('SUM(amount) as totalAmount'),
				knexDb.raw('COUNT(*) as contributionCount')
			)
			.where({ wishlistId, status: ContributionStatus.COMPLETED })
			.where('isAnonymous', false)
			.groupBy('contributorName')
			.orderBy('totalAmount', 'desc')
			.limit(limit)
			.offset(offset);
	};

	findById = async (id: string): Promise<IContribution | null> => {
		return await knexDb.table('contributions').where({ id }).first();
	};


	update = async (id: string, payload: Partial<IContribution>): Promise<IContribution[]> => {
		return await knexDb('contributions')
			.where({ id })
			.update({ ...payload, updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};
}

export const contributorsRepository = new ContributorsRepository();
