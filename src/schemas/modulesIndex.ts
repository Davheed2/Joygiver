import userModuleSchema from '@/modules/user/validators/schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const moduleSchemaMap: Record<string, any> = {
	'/api/v1/user': userModuleSchema,
	// add more prefixes as you mount modules
};
