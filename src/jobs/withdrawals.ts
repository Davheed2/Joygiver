import cron from 'node-cron';
import { withdrawalRequestRepository } from '@/modules/wallet/repository';
import { paystackService } from '@/modules/wallet/services';
import { extractErrorMessage } from '@/middlewares';

// Process pending withdrawals every 5 minutes
export const startWithdrawalProcessingCron = () => {
	cron.schedule('*/5 * * * *', async () => {
		try {
			console.log('[CRON] Running withdrawal processing job...');

			const pendingWithdrawals = await withdrawalRequestRepository.findPending();
			if (pendingWithdrawals.length === 0) {
				console.log('[CRON] No pending withdrawals to process');
				return;
			}

			console.log(`[CRON] Processing ${pendingWithdrawals.length} pending withdrawal(s)`);

			for (const withdrawal of pendingWithdrawals) {
				try {
					await withdrawalRequestRepository.processWithdrawal(withdrawal.id);
					console.log(`[CRON] ✅ Processed withdrawal: ${withdrawal.id}`);
				} catch (error: unknown) {
					const message = extractErrorMessage(error);
					console.error(`[CRON] ❌ Failed to process withdrawal ${withdrawal.id}:`, message);
				}
			}

			console.log('[CRON] Withdrawal processing job completed');
		} catch (error: unknown) {
			console.error('[CRON] Withdrawal processing job failed:', extractErrorMessage(error));
		}
	});

	console.log('✅ Withdrawal processing cron job started (runs every 5 minutes)');
};

// Check status of processing withdrawals every 10 minutes
export const startWithdrawalStatusCheckCron = () => {
	cron.schedule('*/10 * * * *', async () => {
		try {
			console.log('[CRON] Running withdrawal status check job...');

			const processingWithdrawals = await withdrawalRequestRepository.findByStatus('processing');
			if (processingWithdrawals.length === 0) {
				console.log('[CRON] No processing withdrawals to check');
				return;
			}

			console.log(`[CRON] Checking status for ${processingWithdrawals.length} withdrawal(s)`);

			for (const withdrawal of processingWithdrawals) {
				try {
					if (!withdrawal.transferCode) {
						console.warn(`[CRON] ⚠️ Withdrawal ${withdrawal.id} has no transfer code, skipping...`);
						continue;
					}

					// Check status on Paystack
					const transfer = await paystackService.verifyTransfer(withdrawal.transferCode);
					console.log(`[CRON] Transfer ${withdrawal.transferCode} status: ${transfer.status}`);

					if (transfer.status === 'success') {
						await withdrawalRequestRepository.completeWithdrawal(withdrawal.id);
						console.log(`[CRON] ✅ Completed withdrawal: ${withdrawal.id}`);
					} else if (transfer.status === 'failed') {
						const failureReason = transfer.message || 'Transfer failed on Paystack';
						await withdrawalRequestRepository.failWithdrawal(withdrawal.id, failureReason);
						console.log(`[CRON] ❌ Failed withdrawal: ${withdrawal.id} - ${failureReason}`);
					} else if (transfer.status === 'reversed') {
						await withdrawalRequestRepository.failWithdrawal(withdrawal.id, 'Transfer was reversed');
						console.log(`[CRON] 🔄 Reversed withdrawal: ${withdrawal.id}`);
					} else {
						console.log(`[CRON] ⏳ Withdrawal ${withdrawal.id} still processing (status: ${transfer.status})`);
					}
				} catch (error: unknown) {
					console.error(`[CRON] ❌ Failed to check withdrawal ${withdrawal.id}:`, extractErrorMessage(error));
				}
			}

			console.log('[CRON] Withdrawal status check job completed');
		} catch (error: unknown) {
			console.error('[CRON] Withdrawal status check job failed:', extractErrorMessage(error));
		}
	});

	console.log('✅ Withdrawal status check cron job started (runs every 10 minutes)');
};

// Daily summary job (runs at midnight)
// export const startDailySummaryCron = () => {
// 	cron.schedule('0 0 * * *', async () => {
// 		try {
// 			console.log('[CRON] Running daily wallet summary job...');

// 			const today = new Date();
// 			today.setHours(0, 0, 0, 0);

// 			const stats = await withdrawalRequestRepository.getDailyStats(today);

// 			console.log('[CRON] Daily Summary:', {
// 				date: today.toISOString().split('T')[0],
// 				totalWithdrawals: stats.total,
// 				completed: stats.completed,
// 				failed: stats.failed,
// 				pending: stats.pending,
// 				totalAmount: stats.totalAmount,
// 			});
// 		} catch (error: unknown) {
// 			console.error('[CRON] Daily summary job failed:', extractErrorMessage(error));
// 		}
// 	});

// 	console.log('✅ Daily summary cron job started (runs at midnight)');
// };

// Export all cron starters
export const startAllWalletCrons = () => {
	startWithdrawalProcessingCron();
	startWithdrawalStatusCheckCron();
	// startDailySummaryCron();
};

export const stopAllCrons = () => {
	console.log('🛑 Stopping all wallet cron jobs...');
};
