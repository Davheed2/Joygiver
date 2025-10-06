import { Request, Response } from 'express';
import { AppError, AppResponse, toJSON, uploadPictureFile } from '@/common/utils';
import { catchAsync } from '@/middlewares';
import { Gender, GiftSelectionMode, WishlistStatus } from '@/common/constants';
import { nanoid } from 'nanoid';
import slugify from 'slugify';
import { knexDb } from '@/common/config';
import {
	categoryRepository,
	curatedItemRepository,
	wishlistItemRepository,
	wishlistRepository,
	wishlistViewRepository,
} from '../repository';
import { ICategory, ICuratedItem, IWishlistItem } from '@/common/interfaces';
import { userRepository } from '@/modules/user/repository';

export class WishlistController {
	// Admin functions for categories
	createCategory = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { name, iconUrl } = req.body;

		if (!user) {
			throw new AppError('Please log in to create a category', 401);
		}
		if (user.role !== 'admin') {
			throw new AppError('Only admins can create categories', 403);
		}
		if (!name) {
			throw new AppError('Name is required', 400);
		}

		const [category] = await categoryRepository.create({
			name,
			iconUrl,
		});
		if (!category) {
			throw new AppError('Failed to create category', 500);
		}

		return AppResponse(res, 201, toJSON([category]), 'Category created successfully');
	});

	getCategories = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;

		if (!user) {
			throw new AppError('Please log in to view categories', 401);
		}

		const categories = await categoryRepository.findAll();
		if (!categories) {
			throw new AppError('Failed to fetch active categories', 500);
		}

		return AppResponse(res, 200, toJSON(categories), 'Categories fetched successfully');
	});

	updateCategory = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { categoryId, name, iconUrl } = req.body;

		if (!user) {
			throw new AppError('Please log in to update a category', 401);
		}
		if (user.role !== 'admin') {
			throw new AppError('Only admins can update categories', 403);
		}
		if (!categoryId) {
			throw new AppError('Category ID is required', 400);
		}

		const existingCategory = await categoryRepository.findById(categoryId);
		if (!existingCategory) {
			throw new AppError('Category not found', 404);
		}

		const updatePayload: Partial<ICategory> = {};
		if (name) updatePayload.name = name;
		if (iconUrl) updatePayload.iconUrl = iconUrl;

		const [updatedCategories] = await categoryRepository.update(categoryId, updatePayload);
		if (!updatedCategories) {
			throw new AppError('Failed to update category', 500);
		}
		return AppResponse(res, 200, toJSON([updatedCategories]), 'Category updated successfully');
	});

	deleteCategory = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { categoryId } = req.body;

		if (!user) {
			throw new AppError('Please log in to delete a category', 401);
		}
		if (user.role !== 'admin') {
			throw new AppError('Only admins can delete categories', 403);
		}
		if (!categoryId) {
			throw new AppError('Category ID is required', 400);
		}

		const existingCategory = await categoryRepository.findById(categoryId);
		if (!existingCategory) {
			throw new AppError('Category not found', 404);
		}

		const deletedCount = await categoryRepository.delete(categoryId);
		if (deletedCount === 0) {
			throw new AppError('Failed to delete category', 500);
		}

		return AppResponse(res, 200, null, 'Category deleted successfully');
	});

	// Curated items
	createCuratedItem = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { name, imageUrl, price, categoryId, gender } = req.body;
		const imageFile = req.file;

		if (!user) {
			throw new AppError('Please log in to create a curated item', 401);
		}
		if (user.role !== 'admin') {
			throw new AppError('Only admins can create curated items', 403);
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

		const deletedCount = await curatedItemRepository.delete(curatedItemId);
		if (deletedCount === 0) {
			throw new AppError('Failed to delete curated item', 500);
		}

		return AppResponse(res, 200, null, 'Curated item deleted successfully');
	});

	// Wishlist functions
	createWishlist = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { celebrationEvent, celebrationDate, giftSelectionMode, categoryIds, items } = req.body;

		if (!user) {
			throw new AppError('Please log in to create a wishlist', 401);
		}
		if (!celebrationEvent || !celebrationDate || !giftSelectionMode) {
			throw new AppError('Celebration event, date, and gift selection mode are required', 400);
		}
		if (!Object.values(GiftSelectionMode).includes(giftSelectionMode)) {
			throw new AppError('Invalid gift selection mode', 400);
		}
		if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
			throw new AppError('At least one category is required', 400);
		}

		const celebrationDateObj = new Date(celebrationDate);
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		if (celebrationDateObj < today) {
			throw new AppError('Celebration date cannot be in the past', 400);
		}
		if (items && (!Array.isArray(items) || items.length === 0)) {
			throw new AppError('Items must be a non-empty array', 400);
		}

		if (items) {
			for (const item of items) {
				if (!item.curatedItemId) {
					throw new AppError('Each item must have curatedItemId', 400);
				}
			}
		}

		const uniqueId = nanoid(6);
		const uniqueLink = `https://joygiver.com/${slugify(celebrationEvent, { lower: true, strict: true })}-${uniqueId}`;

		const expiresAt = new Date(celebrationDateObj);
		expiresAt.setDate(expiresAt.getDate() + 7);

		const result = await knexDb.transaction(async () => {
			const [wishlist] = await wishlistRepository.create({
				id: user.id,
				celebrationEvent,
				celebrationDate: celebrationDateObj,
				giftSelectionMode,
				uniqueLink,
				status: WishlistStatus.ACTIVE,
				expiresAt,
			});
			if (!wishlist) {
				throw new AppError('Failed to create wishlist', 500);
			}

			console.log('Created wishlist:', wishlist);

			let createdItems: IWishlistItem[] = [];
			if (items && items.length > 0) {
				const fetchedItems = await curatedItemRepository.findByIds(
					items
						.filter((item: IWishlistItem) => item.curatedItemId)
						.map((item: IWishlistItem) => item.curatedItemId as string)
				);
				const fetchedItemsMap = new Map(fetchedItems.map((item) => [item.id, item]));
				for (const item of items) {
					if (item.curatedItemId && !fetchedItemsMap.has(item.curatedItemId)) {
						throw new AppError(`Curated item with ID ${item.curatedItemId} not found`, 400);
					}
				}

				const wishlistItems = items.map((item: { curatedItemId: string }, index: number) => {
					const curated = fetchedItemsMap.get(item.curatedItemId);
					if (!curated) {
						throw new AppError(`Curated item with ID ${item.curatedItemId} not found`, 400);
					}
					return {
						wishlistId: wishlist.id,
						curatedItemId: curated.id,
						name: curated.name,
						imageUrl: curated.imageUrl,
						price: curated.price,
						categoryId: curated.categoryId,
						priority: index + 1,
					};
				});

				createdItems = await wishlistItemRepository.createMany(wishlistItems);
			}

			return { wishlist, items: createdItems };
		});

		console.log('Final result:', result);
		const { wishlist, items: createdItems } = result;
		console.log('Wishlist:', wishlist);
		console.log('Created Items:', createdItems);

		// const responseData = {
		// 	...result.wishlist,
		// };
		// if (result.items.length > 0) {
		// 	responseData.items = result.items;
		// }

		// if (result.suggestedItems.length > 0) {
		// 	responseData.suggestedItems = result.suggestedItems;
		// 	responseData.message = 'Here are some curated items for you!';
		// }

		return AppResponse(
			res,
			201,
			//null,
			result,
			items && items.length > 0
				? 'Wishlist created successfully with items'
				: 'Wishlist created successfully. Add items to continue.'
		);
	});

	addItemsToWishlist = catchAsync(async (req: Request, res: Response) => {
		const { user } = req;
		const { items, wishlistId } = req.body;

		if (!user) {
			throw new AppError('Please log in to add items to a wishlist', 401);
		}
		if (!wishlistId) {
			throw new AppError('Wishlist ID is required', 400);
		}
		if (!items || !Array.isArray(items) || items.length === 0) {
			throw new AppError('Items array is required', 400);
		}

		const wishlist = await wishlistRepository.findById(wishlistId);
		if (!wishlist) {
			throw new AppError('Wishlist not found', 404);
		}
		if (wishlist.userId !== user.id) {
			throw new AppError('Unauthorized to modify this wishlist', 403);
		}

		for (const item of items) {
			if (!item.curatedItemId) {
				throw new AppError('Each item must have a curatedItemId', 400);
			}
		}

		const fetchedItems = await curatedItemRepository.findByIds(
			items
				.filter((item: IWishlistItem) => item.curatedItemId)
				.map((item: IWishlistItem) => item.curatedItemId as string)
		);
		const fetchedItemsMap = new Map(fetchedItems.map((item) => [item.id, item]));
		for (const item of items) {
			if (item.curatedItemId && !fetchedItemsMap.has(item.curatedItemId)) {
				throw new AppError(`Curated item with ID ${item.curatedItemId} not found`, 400);
			}
		}

		const wishlistItems = items.map((item: { curatedItemId: string }, index: number) => {
			const curated = fetchedItemsMap.get(item.curatedItemId);
			if (!curated) {
				throw new AppError(`Curated item with ID ${item.curatedItemId} not found`, 400);
			}
			return {
				wishlistId: wishlist.id,
				curatedItemId: curated.id,
				name: curated.name,
				imageUrl: curated.imageUrl,
				price: curated.price,
				categoryId: curated.categoryId,
				priority: index + 1,
			};
		});

		const [addedItems] = await wishlistItemRepository.createMany(wishlistItems);
		if (!addedItems) {
			throw new AppError('Failed to add items to wishlist', 500);
		}

		return AppResponse(res, 201, toJSON([addedItems]), 'Items added to wishlist successfully');
	});

	getWishlistByLink = catchAsync(async (req: Request, res: Response) => {
		const { uniqueLink } = req.query;

		if (!uniqueLink) {
			throw new AppError('Unique link is required', 400);
		}

		const wishlist = await wishlistRepository.findByUniqueLink(uniqueLink as string);
		if (!wishlist) {
			throw new AppError('Wishlist not found', 404);
		}
		if (!wishlist.isPublic && wishlist.status !== WishlistStatus.ACTIVE) {
			throw new AppError('This wishlist is not available', 403);
		}

		await wishlistRepository.incrementViewCount(wishlist.id);

		const items = await wishlistItemRepository.findByWishlistId(wishlist.id);
		if (!items) {
			throw new AppError('No items found in this wishlist', 404);
		}

		await wishlistViewRepository.create({
			wishlistId: wishlist.id,
			ipAddress: req.ip,
			userAgent: req.get('user-agent') || '',
			referrer: req.get('referer'),
		});

		return AppResponse(res, 200, { wishlist: toJSON(wishlist), items }, 'Wishlist fetched successfully');
	});
}

export const wishlistController = new WishlistController();
