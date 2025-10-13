import { knexDb } from '@/common/config';
import { ContributionStatus } from '@/common/constants';
import { IContribution, IContributorStats } from '@/common/interfaces';
import { AppError } from '@/common/utils';
import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';
import { wishlistRepository } from './wishlistRepository';
import { wishlistItemRepository } from './wishlistItemRepository';
import { paystackService } from '@/modules/wallet/services';
import { walletRepository } from '@/modules/wallet/repository';

class ContributorsRepository {
	create = async (payload: Partial<IContribution>) => {
		return await knexDb.table('contributions').insert(payload).returning('*');
	};

	findById = async (id: string): Promise<IContribution | null> => {
		return await knexDb.table('contributions').where({ id }).first();
	};

	findByReference = async (reference: string): Promise<IContribution | null> => {
		return await knexDb.table('contributions').where({ paymentReference: reference }).first();
	};

	findByWishlistId = async (wishlistId: string, page = 1, limit = 20): Promise<IContribution[]> => {
		const offset = (page - 1) * limit;
		return await knexDb
			.table('contributions')
			.where({ wishlistId, status: 'completed' })
			.orderBy('created_at', 'desc')
			.limit(limit)
			.offset(offset);
	};

	findByWishlistItemId = async (wishlistItemId: string, page = 1, limit = 20): Promise<IContribution[]> => {
		const offset = (page - 1) * limit;
		return await knexDb
			.table('contributions')
			.where({ wishlistItemId, status: ContributionStatus.COMPLETED })
			.orderBy('created_at', 'desc')
			.limit(limit)
			.offset(offset);
	};

	findByEmail = async (email: string): Promise<IContribution[]> => {
		return await knexDb
			.table('contributions')
			.where({ contributorEmail: email.toLowerCase(), status: 'completed' })
			.orderBy('created_at', 'desc');
	};

	update = async (id: string, payload: Partial<IContribution>): Promise<IContribution[]> => {
		return await knexDb('contributions')
			.where({ id })
			.update({ ...payload, updated_at: DateTime.now().toJSDate() })
			.returning('*');
	};

	getByReference = async (reference: string): Promise<IContribution | null> => {
		return await this.findByReference(reference);
	};

	countByWishlistId = async (wishlistId: string): Promise<number> => {
		const result = await knexDb
			.table('contributions')
			.where({ wishlistId, status: 'completed' })
			.count<{ count: string }[]>('* as count')
			.first();
		return Number(result?.count || 0);
	};

	countByWishlistItemId = async (wishlistItemId: string): Promise<number> => {
		const result = await knexDb
			.table('contributions')
			.where({ wishlistItemId, status: 'completed' })
			.count<{ count: string }[]>('* as count')
			.first();
		return Number(result?.count || 0);
	};

	// Get top contributors for a wishlist
	getTopContributors = async (wishlistId: string, limit = 10): Promise<IContributorStats[]> => {
		const contributors = await knexDb('contributions')
			.select(
				'contributorName',
				'contributorEmail',
				knexDb.raw('SUM(amount) as amount'),
				knexDb.raw('COUNT(*) as contributionCount'),
				knexDb.raw('MAX(created_at) as lastContribution')
			)
			.where({ wishlistId, status: 'completed', isAnonymous: false })
			.groupBy('contributorName', 'contributorEmail')
			.orderBy('amount', 'desc')
			.limit(limit);

		return contributors.map((c, index) => ({
			rank: index + 1,
			contributorName: c.contributorName,
			contributorInitials: c.contributorName
				.split(' ')
				.map((n: string) => n[0])
				.join('')
				.toUpperCase()
				.slice(0, 2),
			totalAmount: Number(c.amount),
			contributionCount: Number(c.contributionCount),
			lastContribution: c.lastContribution,
		}));
	};

	// Get unique contributors count
	getUniqueContributorsCount = async (wishlistId: string): Promise<number> => {
		const result = await knexDb('contributions')
			.where({ wishlistId, status: 'completed' })
			.countDistinct('contributorEmail as count')
			.first();
		return Number(result?.count || 0);
	};

	initiateContribution = async (data: {
		wishlistItemId: string;
		contributorName: string;
		contributorEmail: string;
		contributorPhone?: string;
		amount: number;
		message?: string;
		isAnonymous?: boolean;
	}): Promise<{ contribution: IContribution; paymentUrl: string }> => {
		const item = await wishlistItemRepository.findById(data.wishlistItemId);
		if (!item) {
			throw new AppError('Wishlist item not found', 404);
		}

		const wishlist = await wishlistRepository.findById(item.wishlistId);
		if (!wishlist) {
			throw new AppError('Wishlist not found', 404);
		}

		if (wishlist.status !== 'active') {
			throw new AppError('This wishlist is not accepting contributions', 400);
		}

		//const remainingAmount = item.price - item.totalContributed;
		// if (data.amount > remainingAmount) {
		// 	throw new AppError(`Amount exceeds remaining balance. Only ₦${remainingAmount.toLocaleString()} needed`, 400);
		// }

		if (data.amount < 100) {
			throw new AppError('Minimum contribution amount is ₦100', 400);
		}

		const reference = `CONT-${nanoid(16)}`;

		const [contribution] = await this.create({
			wishlistId: wishlist.id,
			wishlistItemId: item.id,
			contributorName: data.contributorName,
			contributorEmail: data.contributorEmail.toLowerCase(),
			contributorPhone: data.contributorPhone,
			message: data.message,
			isAnonymous: data.isAnonymous || false,
			amount: data.amount,
			status: ContributionStatus.PENDING,
			paymentMethod: 'paystack',
			paymentReference: reference,
		});

		const paymentData = await paystackService.initializePayment({
			email: data.contributorEmail,
			amount: data.amount,
			reference,
			metadata: {
				contributionId: contribution.id,
				wishlistId: wishlist.id,
				wishlistItemId: item.id,
				contributorName: data.contributorName,
				itemName: item.name,
			},
			callbackUrl: `${wishlist.uniqueLink}`,
		});

		return {
			contribution,
			paymentUrl: paymentData.authorization_url,
			//accessCode: paymentData.access_code,
		};
	};

	handleSuccessfulPayment = async (contributionId: string, paymentReference: string): Promise<void> => {
		const contribution = await this.findById(contributionId);
		if (!contribution) {
			throw new AppError('Contribution not found', 404);
		}

		if (contribution.status === 'completed') {
			console.log('Contribution already processed:', contributionId);
			return;
		}

		const wishlistItem = await wishlistItemRepository.findById(contribution.wishlistItemId);
		if (!wishlistItem) {
			throw new AppError('Wishlist item not found', 404);
		}

		const wishlist = await wishlistRepository.findById(contribution.wishlistId);
		if (!wishlist) {
			throw new AppError('Wishlist not found', 404);
		}

		await knexDb.transaction(async (trx) => {
			await trx('contributions').where({ id: contributionId }).update({
				status: 'completed',
				paystackReference: paymentReference,
				paidAt: new Date(),
				updated_at: new Date(),
			});

			// Update wishlist item
			const newTotal = Number(wishlistItem.totalContributed) + Number(contribution.amount);
			const isFunded = newTotal >= wishlistItem.price;

			await trx('wishlist_items')
				.where({ id: wishlistItem.id })
				.update({
					totalContributed: newTotal,
					contributorsCount: knexDb.raw('"contributorsCount" + 1'),
					isFunded,
					fundedAt: isFunded && !wishlistItem.fundedAt ? new Date() : wishlistItem.fundedAt,
					updated_at: new Date(),
				});

			// Update wishlist stats
			const uniqueContributors = await trx('contributions')
				.where({ wishlistId: wishlist.id, status: 'completed' })
				.countDistinct('contributorEmail as count')
				.first();

			const totalContributed = await trx('contributions')
				.where({ wishlistId: wishlist.id, status: 'completed' })
				.sum('amount as total')
				.first();

			await trx('wishlists')
				.where({ id: wishlist.id })
				.update({
					contributorsCount: Number(uniqueContributors?.count || 0),
					totalContributed: Number(totalContributed?.total || 0),
					updated_at: new Date(),
				});

			// Credit wallet
			await walletRepository.creditWallet(
				wishlist.userId,
				contribution.amount,
				paymentReference,
				`Contribution from ${contribution.contributorName || 'Anonymous'} for ${wishlistItem.name}`
			);

			// Confirm balance immediately (payment verified by Paystack)
			await walletRepository.confirmPendingBalance(wishlist.userId, contribution.amount, paymentReference);
		});

		// Send notification to wishlist owner
		// TODO: Implement email/push notification
		console.log('✅ Contribution processed:', contributionId);
	};

	getWishlistContributions = async (wishlistId: string, page = 1, limit = 20) => {
		const contributions = await this.findByWishlistId(wishlistId, page, limit);
		const total = await this.countByWishlistId(wishlistId);

		return {
			data: contributions,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	};

	getItemContributions = async (wishlistItemId: string, page = 1, limit = 20) => {
		const contributions = await this.findByWishlistItemId(wishlistItemId, page, limit);
		const total = await this.countByWishlistItemId(wishlistItemId);

		return {
			data: contributions,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	};

	// getTopContributors = async (wishlistId: string, limit = 10) => {
	// 	return await this.getTopContributors(wishlistId, limit);
	// };

	replyToContributor = async (contributionId: string, userId: string, reply: string): Promise<void> => {
		const contribution = await this.findById(contributionId);
		if (!contribution) {
			throw new AppError('Contribution not found', 404);
		}

		const wishlist = await wishlistRepository.findById(contribution.wishlistId);
		if (!wishlist) {
			throw new AppError('Wishlist not found', 404);
		}

		if (wishlist.userId !== userId) {
			throw new AppError('Unauthorized', 403);
		}

		await this.update(contributionId, {
			ownerReply: reply,
			repliedAt: new Date(),
		});

		// Send email to contributor
		// TODO: Implement email sending
		console.log('Reply sent to contributor:', contribution.contributorEmail);
	};

	refundContribution = async (contributionId: string, reason: string): Promise<void> => {
		const contribution = await this.findById(contributionId);
		if (!contribution) {
			throw new AppError('Contribution not found', 404);
		}

		if (contribution.status !== 'completed') {
			throw new AppError('Only completed contributions can be refunded', 400);
		}

		const wishlistItem = await wishlistItemRepository.findById(contribution.wishlistItemId);
		if (!wishlistItem) {
			throw new AppError('Wishlist item not found', 404);
		}

		const wishlist = await wishlistRepository.findById(contribution.wishlistId);
		if (!wishlist) {
			throw new AppError('Wishlist not found', 404);
		}

		await knexDb.transaction(async (trx) => {
			// Update contribution status
			await trx('contributions').where({ id: contributionId }).update({
				status: 'refunded',
				updated_at: new Date(),
			});

			// Decrement wishlist item totals
			const newTotal = Math.max(0, Number(wishlistItem.totalContributed) - Number(contribution.amount));
			const isFunded = newTotal >= wishlistItem.price;

			await trx('wishlist_items')
				.where({ id: wishlistItem.id })
				.update({
					totalContributed: newTotal,
					contributorsCount: knexDb.raw('GREATEST(contributors_count - 1, 0)'),
					isFunded,
					fundedAt: isFunded ? wishlistItem.fundedAt : null,
					updated_at: new Date(),
				});

			// Update wishlist stats
			const uniqueContributors = await trx('contributions')
				.where({ wishlistId: wishlist.id, status: 'completed' })
				.countDistinct('contributorEmail as count')
				.first();

			const totalContributed = await trx('contributions')
				.where({ wishlistId: wishlist.id, status: 'completed' })
				.sum('amount as total')
				.first();

			await trx('wishlists')
				.where({ id: wishlist.id })
				.update({
					contributorsCount: Number(uniqueContributors?.count || 0),
					totalContributed: Number(totalContributed?.total || 0),
					updated_at: new Date(),
				});

			// Deduct from wallet
			const wallet = await trx('wallets').where({ userId: wishlist.userId }).first();
			if (wallet && wallet.availableBalance >= contribution.amount) {
				await trx('wallets')
					.where({ id: wallet.id })
					.decrement('availableBalance', contribution.amount)
					.decrement('totalReceived', contribution.amount)
					.update({ updated_at: new Date() });

				// Create refund transaction
				await trx('wallet_transactions').insert({
					userId: wishlist.userId,
					walletId: wallet.id,
					type: 'refund',
					amount: -contribution.amount,
					balanceBefore: wallet.availableBalance,
					balanceAfter: wallet.availableBalance - contribution.amount,
					reference: `${contribution.paymentReference}-REFUND`,
					description: `Refund: ${reason}`,
					metadata: { contributionId },
				});
			}
		});

		// TODO: Initiate Paystack refund
		console.log('Contribution refunded:', contributionId);
	};
}

export const contributionRepository = new ContributorsRepository();
