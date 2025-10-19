import userModuleSchema from '@/modules/user/validators/schema';
import wishlistModuleSchema from '@/modules/wishlist/validators/schema';
import walletModuleSchema from '@/modules/wallet/validators/schema';
import notificationModuleSchema from '@/modules/notification/validators/schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const moduleSchemaMap: Record<string, any> = {
	'/api/v1/user': userModuleSchema,
	'/api/v1/wishlist': wishlistModuleSchema,
	'/api/v1/wallet': walletModuleSchema,
	'/api/v1/notification': notificationModuleSchema,
	// add more prefixes as you mount modules
};
