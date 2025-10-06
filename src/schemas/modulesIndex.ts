import userModuleSchema from '@/modules/user/validators/schema';
import wishlistModuleSchema from '@/modules/wishlist/validators/schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const moduleSchemaMap: Record<string, any> = {
	'/api/v1/user': userModuleSchema,
	'/api/v1/wishlist': wishlistModuleSchema,
	// add more prefixes as you mount modules
};
