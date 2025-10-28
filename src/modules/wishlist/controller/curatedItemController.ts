import { Request, Response } from 'express';
import { AppError, AppResponse, toJSON, uploadPictureFile } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { Gender } from '@/common/constants';
import { categoryRepository, curatedItemRepository } from '../repository';
import { ICuratedItem } from '@/common/interfaces';
import { userRepository } from '@/modules/user/repository';

export class CuratedItemController {
	// Curated items
	createCuratedItem = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { name, imageUrl, price, categoryId, gender } = req.body;
		const imageFile = req.file;

		if (!user) {
			throw new AppError('Please log in to create a curated item', 401);
		}
		if (!name || !price || !categoryId || !gender) {
			throw new AppError('Name, price, category, and gender are required', 400);
		}
		if (price <= 0) {
			throw new AppError('Price must be greater than 0', 400);
		}

		const genderMap: Record<string, Gender> = {
			male: Gender.MALE,
			female: Gender.FEMALE,
			prefer_not_to_say: Gender.PREFER_NOT_TO_SAY,
		};

		const mappedGender = genderMap[gender.toLowerCase()];
		if (!mappedGender) {
			throw new AppError('Invalid gender. Must be male, female, or prefer_not_to_say', 400);
		}

		const category = await categoryRepository.findById(categoryId);
		if (!category) {
			throw new AppError('Category not found', 404);
		}

		const isAdmin = user.role === 'admin';
		const itemType = isAdmin ? 'global' : 'custom';
		const isPublic = isAdmin;

		let finalImageUrl: string | undefined = undefined;
		if (imageFile) {
			const { secureUrl } = await uploadPictureFile({
				fileName: `curated-item/${Date.now()}-${imageFile.originalname}`,
				buffer: imageFile.buffer,
				mimetype: imageFile.mimetype,
			});

			finalImageUrl = secureUrl;
		} else if (imageUrl) {
			finalImageUrl = imageUrl;
		}

		const [curatedItem] = await curatedItemRepository.create({
			name,
			imageUrl: finalImageUrl,
			price: parseFloat(price),
			categoryId: categoryId,
			gender: mappedGender,
			popularity: 0,
			isActive: true,
			createdBy: user.id, 
			itemType, 
			isPublic,
		});

		if (!curatedItem) {
			throw new AppError('Failed to create curated item', 500);
		}

		return AppResponse(res, 201, toJSON([curatedItem]), 'Curated item created successfully');
	});

	getCuratedItems = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { categoryIds, budgetMin, budgetMax, page = 1, limit = 20 } = req.query;

		if (!user) {
			throw new AppError('Authentication required', 401);
		}

		const existingUser = await userRepository.findById(user.id);
		if (!existingUser) {
			throw new AppError('User not found', 404);
		}

		let categoryArray: string[] | undefined;
		if (categoryIds) {
			const categoryArrayRaw = typeof categoryIds === 'string' ? categoryIds.split(',') : categoryIds;
			categoryArray = Array.isArray(categoryArrayRaw) ? categoryArrayRaw.map((c) => String(c)) : [];
			if (categoryArray.length === 0) {
				throw new AppError('If categoryIds is provided, at least one category is required', 400);
			}
		}

		let minPrice: number | undefined;
		let maxPrice: number | undefined;

		if (budgetMin) {
			minPrice = parseFloat(budgetMin as string);
			if (isNaN(minPrice) || minPrice < 0) {
				throw new AppError('Invalid budget minimum', 400);
			}
		}

		if (budgetMax) {
			maxPrice = parseFloat(budgetMax as string);
			if (isNaN(maxPrice) || maxPrice < 0) {
				throw new AppError('Invalid budget maximum', 400);
			}
		}

		if (minPrice !== undefined && maxPrice !== undefined && minPrice >= maxPrice) {
			throw new AppError('Budget minimum must be less than budget maximum', 400);
		}

		const pageNum = parseInt(page as string, 10);
		const limitNum = parseInt(limit as string, 10);

		const userGender = existingUser.gender;
		let items: ICuratedItem[];
		let totalItems: number;

		if (userGender === 'prefer not to say') {
			const result = await curatedItemRepository.findByCategoriesAllGenders(
				categoryArray,
				minPrice,
				maxPrice,
				pageNum,
				limitNum
			);
			items = result.items;
			totalItems = result.total;
		} else {
			const genderMap: Record<string, Gender> = {
				male: Gender.MALE,
				female: Gender.FEMALE,
				other: Gender.PREFER_NOT_TO_SAY,
			};
			const mappedGender = genderMap[userGender] || Gender.PREFER_NOT_TO_SAY;

			const result = await curatedItemRepository.findByCategoriesAndGenderPaginated(
				categoryArray,
				mappedGender,
				minPrice,
				maxPrice,
				pageNum,
				limitNum
			);
			items = result.items;
			totalItems = result.total;
		}

		return AppResponse(
			res,
			200,
			{
				items,
				pagination: {
					page: pageNum,
					limit: limitNum,
					total: totalItems,
					totalPages: Math.ceil(totalItems / limitNum),
				},
			},
			'Curated items fetched successfully'
		);
	});

	updateCuratedItem = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { name, imageUrl, price, categoryId, gender, curatedItemId } = req.body;
		const imageFile = req.file;

		if (!user) {
			throw new AppError('User not found', 404);
		}
		if (user.role !== 'admin') {
			throw new AppError('Admin access required', 403);
		}
		if (price !== undefined && price <= 0) {
			throw new AppError('Price must be greater than 0', 400);
		}
		let mappedGender: Gender | undefined;
		if (gender) {
			const genderMap: Record<string, Gender> = {
				male: Gender.MALE,
				female: Gender.FEMALE,
				prefer_not_to_say: Gender.PREFER_NOT_TO_SAY,
			};
			mappedGender = genderMap[gender.toLowerCase()];
			if (!mappedGender) {
				throw new AppError('Invalid gender. Must be male, female, or prefer_not_to_say', 400);
			}
		}

		if (categoryId) {
			const category = await categoryRepository.findById(categoryId);
			if (!category) {
				throw new AppError('Category not found', 404);
			}
		}

		const existingItem = await curatedItemRepository.findById(curatedItemId);
		if (!existingItem) {
			throw new AppError('Curated item not found', 404);
		}

		let finalImageUrl: string | undefined = undefined;
		if (imageFile) {
			const { secureUrl } = await uploadPictureFile({
				fileName: `curated-item/${Date.now()}-${imageFile.originalname}`,
				buffer: imageFile.buffer,
				mimetype: imageFile.mimetype,
			});

			finalImageUrl = secureUrl;
		} else if (imageUrl) {
			finalImageUrl = imageUrl;
		}

		const updatePayload: Partial<ICuratedItem> = {};
		if (name) updatePayload.name = name;
		if (finalImageUrl) updatePayload.imageUrl = finalImageUrl;
		if (price !== undefined) updatePayload.price = parseFloat(price);
		if (categoryId) updatePayload.categoryId = categoryId;
		if (mappedGender) updatePayload.gender = mappedGender;

		const [updatedItems] = await curatedItemRepository.update(curatedItemId, updatePayload);
		if (!updatedItems) {
			throw new AppError('Failed to update curated item', 500);
		}

		return AppResponse(res, 200, toJSON([updatedItems]), 'Curated item updated successfully');
	});

	deleteCuratedItem = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { curatedItemId } = req.body;

		if (!user) {
			throw new AppError('User not found', 404);
		}
		if (user.role !== 'admin') {
			throw new AppError('Admin access required', 403);
		}
		if (!curatedItemId) {
			throw new AppError('Curated item ID is required', 400);
		}

		const existingItem = await curatedItemRepository.findById(curatedItemId);
		if (!existingItem) {
			throw new AppError('Curated item not found', 404);
		}

		// Don't allow deleting if item is used in wishlist items
		const usageCount = await curatedItemRepository.countUsage(curatedItemId);
		if (usageCount > 0) {
			throw new AppError('Cannot delete item that is being used in wishlists', 400);
		}

		const deletedCount = await curatedItemRepository.delete(curatedItemId);
		if (deletedCount === 0) {
			throw new AppError('Failed to delete curated item', 500);
		}

		return AppResponse(res, 200, null, 'Curated item deleted successfully');
	});
}

export const curatedItemController = new CuratedItemController();
