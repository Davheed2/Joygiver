import { multerUpload } from '@/common/config';
import { wishlistController } from '../controller';
import { protect } from '@/middlewares/protect';
import express from 'express';

const router = express.Router();

router.use(protect);

/**
 * @openapi
 * /wishlist/create-category:
 *   post:
 *     summary: Create a new category
 *     description: Creates a new category for the wishlist with the provided name and optional icon URL. Only authenticated users with admin privileges can create categories.
 *     tags:
 *       - Wishlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Tech & gadgets"
 *                 description: The name of the category
 *               iconUrl:
 *                 type: string
 *                 nullable: true
 *                 example: "https://iconurl.com"
 *                 description: The URL of the category's icon
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "68f8b8c3-d071-4bcb-8811-65d4efedfbb4"
 *                         description: The unique identifier of the category
 *                       name:
 *                         type: string
 *                         example: "Tech & gadgets"
 *                         description: The name of the category
 *                       iconUrl:
 *                         type: string
 *                         nullable: true
 *                         example: "https://iconurl.com"
 *                         description: The URL of the category's icon
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                         description: Indicates if the category is active
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-06T05:56:10.168Z"
 *                         description: Timestamp when the category was created
 *                 message:
 *                   type: string
 *                   example: "Category created successfully"
 *       400:
 *         description: Bad Request - Missing category name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Name is required"
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Please log in to create a category"
 *       403:
 *         description: Forbidden - User is not an admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Only admins can create categories"
 *       500:
 *         description: Internal Server Error - Failed to create category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Failed to create category"
 */
router.post('/create-category', wishlistController.createCategory);
/**
 * @openapi
 * /wishlist/categories:
 *   get:
 *     summary: Retrieve all active categories
 *     description: Fetches all active categories from the wishlist. Requires user authentication to access the endpoint.
 *     tags:
 *       - Wishlist
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "6e4ac6d9-b2e1-44fb-bb0e-debf564f94de"
 *                         description: The unique identifier of the category
 *                       name:
 *                         type: string
 *                         example: "Just cash"
 *                         description: The name of the category
 *                       iconUrl:
 *                         type: string
 *                         nullable: true
 *                         example: "https://iconurl.com"
 *                         description: The URL of the category's icon
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                         description: Indicates if the category is active
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-06T05:58:09.098Z"
 *                         description: Timestamp when the category was created
 *                 message:
 *                   type: string
 *                   example: "Categories fetched successfully"
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Please log in to view categories"
 *       500:
 *         description: Internal Server Error - Failed to fetch active categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch active categories"
 */
router.get('/categories', wishlistController.getCategories);
/**
 * @openapi
 * /wishlist/update-category:
 *   post:
 *     summary: Update an existing category
 *     description: Updates an existing category in the wishlist with the provided category ID, name, and/or icon URL. Only authenticated users with admin privileges can update categories. At least one field (name or iconUrl) must be provided to update.
 *     tags:
 *       - Wishlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 example: "6e4ac6d9-b2e1-44fb-bb0e-debf564f94de"
 *                 description: The unique identifier of the category to update
 *               name:
 *                 type: string
 *                 nullable: true
 *                 example: "Just cash"
 *                 description: The updated name of the category
 *               iconUrl:
 *                 type: string
 *                 nullable: true
 *                 example: "https://iconurll.com"
 *                 description: The updated URL of the category's icon
 *             required:
 *               - categoryId
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "6e4ac6d9-b2e1-44fb-bb0e-debf564f94de"
 *                         description: The unique identifier of the category
 *                       name:
 *                         type: string
 *                         example: "Just cash"
 *                         description: The name of the category
 *                       iconUrl:
 *                         type: string
 *                         nullable: true
 *                         example: "https://iconurll.com"
 *                         description: The URL of the category's icon
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                         description: Indicates if the category is active
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-06T05:58:09.098Z"
 *                         description: Timestamp when the category was created
 *                 message:
 *                   type: string
 *                   example: "Category updated successfully"
 *       400:
 *         description: Bad Request - Missing category ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Category ID is required"
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Please log in to update a category"
 *       403:
 *         description: Forbidden - User is not an admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Only admins can update categories"
 *       404:
 *         description: Not Found - Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Category not found"
 *       500:
 *         description: Internal Server Error - Failed to update category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Failed to update category"
 */
router.post('/update-category', wishlistController.updateCategory);
/**
 * @openapi
 * /wishlist/delete-category:
 *   post:
 *     summary: Delete a category
 *     description: Deletes an existing category from the wishlist using the provided category ID. Only authenticated users with admin privileges can delete categories.
 *     tags:
 *       - Wishlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 example: "6e4ac6d9-b2e1-44fb-bb0e-debf564f94de"
 *                 description: The unique identifier of the category to delete
 *             required:
 *               - categoryId
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: null
 *                   example: null
 *                   description: No data returned for this response
 *                 message:
 *                   type: string
 *                   example: "Category deleted successfully"
 *       400:
 *         description: Bad Request - Missing category ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Category ID is required"
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Please log in to delete a category"
 *       403:
 *         description: Forbidden - User is not an admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Only admins can delete categories"
 *       404:
 *         description: Not Found - Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Category not found"
 *       500:
 *         description: Internal Server Error - Failed to delete category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Failed to delete category"
 */
router.post('/delete-category', wishlistController.deleteCategory);
/**
 * @openapi
 * /wishlist/create-item:
 *   post:
 *     summary: Create a new curated item
 *     description: Creates a new curated item for the wishlist with the provided name, price, category ID, gender, and optional image URL or file. Only authenticated users with admin privileges can create curated items. The price must be greater than 0, and the gender must be one of 'male', 'female', or 'prefer_not_to_say'. The image can be provided either as a URL or an uploaded file.
 *     tags:
 *       - Wishlist
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Laptop"
 *                 description: The name of the curated item
 *               price:
 *                 type: string
 *                 example: "300000.00"
 *                 description: The price of the curated item (must be greater than 0)
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 example: "68f8b8c3-d071-4bcb-8811-65d4efedfbb4"
 *                 description: The ID of the category to which the item belongs
 *               gender:
 *                 type: string
 *                 enum: [male, female, prefer_not_to_say]
 *                 example: "male"
 *                 description: The gender associated with the curated item
 *               imageUrl:
 *                 type: string
 *                 nullable: true
 *                 example: "https://pub-b3c115b60ec04ceaae8ac7360bf42530.r2.dev/curated-item/1759733504850-image 13.png"
 *                 description: The URL of the curated item's image (optional if file is provided)
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The image file for the curated item (optional if imageUrl is provided)
 *             required:
 *               - name
 *               - price
 *               - categoryId
 *               - gender
 *     responses:
 *       201:
 *         description: Curated item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "aecccb23-4d66-40f9-9849-2600c85fe3b1"
 *                         description: The unique identifier of the curated item
 *                       name:
 *                         type: string
 *                         example: "Laptop"
 *                         description: The name of the curated item
 *                       imageUrl:
 *                         type: string
 *                         nullable: true
 *                         example: "https://pub-b3c115b60ec04ceaae8ac7360bf42530.r2.dev/curated-item/1759733504850-image 13.png"
 *                         description: The URL of the curated item's image
 *                       price:
 *                         type: string
 *                         example: "300000.00"
 *                         description: The price of the curated item
 *                       gender:
 *                         type: string
 *                         example: "male"
 *                         description: The gender associated with the curated item
 *                       popularity:
 *                         type: integer
 *                         example: 0
 *                         description: The popularity score of the curated item
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                         description: Indicates if the curated item is active
 *                       categoryId:
 *                         type: string
 *                         format: uuid
 *                         example: "68f8b8c3-d071-4bcb-8811-65d4efedfbb4"
 *                         description: The ID of the category to which the item belongs
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-06T06:51:46.342Z"
 *                         description: Timestamp when the curated item was created
 *                 message:
 *                   type: string
 *                   example: "Curated item created successfully"
 *       400:
 *         description: Bad Request - Missing required fields, invalid price, or invalid gender
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Name, price, category, and gender are required"
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Please log in to create a curated item"
 *       403:
 *         description: Forbidden - User is not an admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Only admins can create curated items"
 *       404:
 *         description: Not Found - Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Category not found"
 *       500:
 *         description: Internal Server Error - Failed to create curated item
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Failed to create curated item"
 */
router.post('/create-item', multerUpload.single('image'), wishlistController.createCuratedItem);
/**
 * @openapi
 * /wishlist/items:
 *   get:
 *     summary: Retrieve curated items
 *     description: Fetches curated items based on optional filters such as category IDs, budget range, and pagination parameters. Filters items by the authenticated user's gender unless the gender is 'prefer not to say', in which case items for all genders are returned. Requires user authentication.
 *     tags:
 *       - Wishlist
 *     parameters:
 *       - in: query
 *         name: categoryIds
 *         schema:
 *           type: string
 *           example: "68f8b8c3-d071-4bcb-8811-65d4efedfbb4,644ec540-e3d2-4275-a1b7-c9aaa81ca6de"
 *         description: Comma-separated list of category IDs to filter items
 *       - in: query
 *         name: budgetMin
 *         schema:
 *           type: string
 *           example: "100000"
 *         description: Minimum price for filtering items
 *       - in: query
 *         name: budgetMax
 *         schema:
 *           type: string
 *           example: "600000"
 *         description: Maximum price for filtering items
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Curated items fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             example: "7e676ba5-2ed5-4b80-b25b-96609d401d13"
 *                             description: The unique identifier of the curated item
 *                           name:
 *                             type: string
 *                             example: "Iphone"
 *                             description: The name of the curated item
 *                           imageUrl:
 *                             type: string
 *                             nullable: true
 *                             example: "https://pub-b3c115b60ec04ceaae8ac7360bf42530.r2.dev/curated-item/1759733438012-image 13.png"
 *                             description: The URL of the curated item's image
 *                           price:
 *                             type: string
 *                             example: "500000.00"
 *                             description: The price of the curated item
 *                           categoryId:
 *                             type: string
 *                             format: uuid
 *                             example: "68f8b8c3-d071-4bcb-8811-65d4efedfbb4"
 *                             description: The ID of the category to which the item belongs
 *                           gender:
 *                             type: string
 *                             example: "male"
 *                             description: The gender associated with the curated item
 *                           popularity:
 *                             type: integer
 *                             example: 0
 *                             description: The popularity score of the curated item
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                           description: Current page number
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                           description: Number of items per page
 *                         total:
 *                           type: integer
 *                           example: 2
 *                           description: Total number of items
 *                         totalPages:
 *                           type: integer
 *                           example: 1
 *                           description: Total number of pages
 *                 message:
 *                   type: string
 *                   example: "Curated items fetched successfully"
 *       400:
 *         description: Bad Request - Invalid category IDs, budget minimum, budget maximum, or budget range
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Invalid budget minimum"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Authentication required"
 *       404:
 *         description: Not Found - User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "User not found"
 */
router.get('/items', wishlistController.getCuratedItems);
/**
 * @openapi
 * /wishlist/update-item:
 *   post:
 *     summary: Update a curated item
 *     description: Updates an existing curated item in the wishlist with the provided details, including name, image URL or file, price, category ID, and gender. Only authenticated users with admin privileges can update curated items. The price must be greater than 0 if provided, and the gender must be one of 'male', 'female', or 'prefer_not_to_say'. The image can be updated via a URL or an uploaded file.
 *     tags:
 *       - Wishlist
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               curatedItemId:
 *                 type: string
 *                 format: uuid
 *                 example: "7e676ba5-2ed5-4b80-b25b-96609d401d13"
 *                 description: The unique identifier of the curated item to update
 *               name:
 *                 type: string
 *                 nullable: true
 *                 example: "Iphone X"
 *                 description: The updated name of the curated item
 *               imageUrl:
 *                 type: string
 *                 nullable: true
 *                 example: "https://pub-b3c115b60ec04ceaae8ac7360bf42530.r2.dev/curated-item/1759733438012-image 13.png"
 *                 description: The updated URL of the curated item's image (optional if file is provided)
 *               price:
 *                 type: string
 *                 nullable: true
 *                 example: "500000.00"
 *                 description: The updated price of the curated item (must be greater than 0 if provided)
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 example: "68f8b8c3-d071-4bcb-8811-65d4efedfbb4"
 *                 description: The updated ID of the category to which the item belongs
 *               gender:
 *                 type: string
 *                 nullable: true
 *                 enum: [male, female, prefer_not_to_say]
 *                 example: "male"
 *                 description: The updated gender associated with the curated item
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The updated image file for the curated item (optional if imageUrl is provided)
 *             required:
 *               - curatedItemId
 *     responses:
 *       200:
 *         description: Curated item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "7e676ba5-2ed5-4b80-b25b-96609d401d13"
 *                         description: The unique identifier of the curated item
 *                       name:
 *                         type: string
 *                         example: "Iphone X"
 *                         description: The name of the curated item
 *                       imageUrl:
 *                         type: string
 *                         nullable: true
 *                         example: "https://pub-b3c115b60ec04ceaae8ac7360bf42530.r2.dev/curated-item/1759733438012-image 13.png"
 *                         description: The URL of the curated item's image
 *                       price:
 *                         type: string
 *                         example: "500000.00"
 *                         description: The price of the curated item
 *                       gender:
 *                         type: string
 *                         example: "male"
 *                         description: The gender associated with the curated item
 *                       popularity:
 *                         type: integer
 *                         example: 0
 *                         description: The popularity score of the curated item
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                         description: Indicates if the curated item is active
 *                       categoryId:
 *                         type: string
 *                         format: uuid
 *                         example: "68f8b8c3-d071-4bcb-8811-65d4efedfbb4"
 *                         description: The ID of the category to which the item belongs
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-06T06:51:02.520Z"
 *                         description: Timestamp when the curated item was created
 *                 message:
 *                   type: string
 *                   example: "Curated item updated successfully"
 *       400:
 *         description: Bad Request - Invalid price or gender
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Price must be greater than 0"
 *       403:
 *         description: Forbidden - User is not an admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Admin access required"
 *       404:
 *         description: Not Found - User, category, or curated item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Curated item not found"
 *       500:
 *         description: Internal Server Error - Failed to update curated item
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Failed to update curated item"
 */
router.post('/update-item', wishlistController.updateCuratedItem);
/**
 * @openapi
 * /wishlist/delete-item:
 *   post:
 *     summary: Delete a curated item
 *     description: Deletes an existing curated item from the wishlist using the provided curated item ID. Only authenticated users with admin privileges can delete curated items.
 *     tags:
 *       - Wishlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               curatedItemId:
 *                 type: string
 *                 format: uuid
 *                 example: "7e676ba5-2ed5-4b80-b25b-96609d401d13"
 *                 description: The unique identifier of the curated item to delete
 *             required:
 *               - curatedItemId
 *     responses:
 *       200:
 *         description: Curated item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: null
 *                   example: null
 *                   description: No data returned for this response
 *                 message:
 *                   type: string
 *                   example: "Curated item deleted successfully"
 *       400:
 *         description: Bad Request - Missing curated item ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Curated item ID is required"
 *       403:
 *         description: Forbidden - User is not an admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Admin access required"
 *       404:
 *         description: Not Found - User or curated item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Curated item not found"
 *       500:
 *         description: Internal Server Error - Failed to delete curated item
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Failed to delete curated item"
 */
router.post('/delete-item', wishlistController.deleteCuratedItem);
router.post('/seed-data', wishlistController.seedData);
/**
 * @openapi
 * /wishlist/create:
 *   post:
 *     summary: Create a new wishlist
 *     description: Creates a new wishlist for the authenticated user with the specified celebration event, date, and optional items. Ensures the celebration date is not in the past and validates that items, if provided, are a non-empty array with valid curated item IDs. Generates a unique link for the wishlist and sets an expiration date 7 days after the celebration date. Uses a transaction to ensure atomicity when creating the wishlist and associated items.
 *     tags:
 *       - Wishlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               celebrationEvent:
 *                 type: string
 *                 example: "Birthday"
 *                 description: The event associated with the wishlist
 *               celebrationDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-10-31T23:00:00.000Z"
 *                 description: The date of the celebration event
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     curatedItemId:
 *                       type: string
 *                       format: uuid
 *                       example: "aecccb23-4d66-40f9-9849-2600c85fe3b1"
 *                       description: The ID of the curated item to add to the wishlist
 *                 description: Optional list of curated items to include in the wishlist
 *             required:
 *               - celebrationEvent
 *               - celebrationDate
 *     responses:
 *       201:
 *         description: Wishlist created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "e9988d8b-d9c6-4dc8-aaf1-5d8e284eeae6"
 *                         description: The unique identifier of the wishlist
 *                       celebrationEvent:
 *                         type: string
 *                         example: "Birthday"
 *                         description: The event associated with the wishlist
 *                       celebrationDate:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-31T23:00:00.000Z"
 *                         description: The date of the celebration event
 *                       uniqueLink:
 *                         type: string
 *                         example: "https://joygiver.com/birthday-oB1J-V"
 *                         description: A unique URL for accessing the wishlist
 *                       status:
 *                         type: string
 *                         example: "active"
 *                         description: The status of the wishlist
 *                       totalContributed:
 *                         type: string
 *                         example: "0.00"
 *                         description: The total amount contributed to the wishlist
 *                       contributorsCount:
 *                         type: integer
 *                         example: 0
 *                         description: The number of contributors to the wishlist
 *                       viewsCount:
 *                         type: integer
 *                         example: 0
 *                         description: The number of views of the wishlist
 *                       isPublic:
 *                         type: boolean
 *                         example: true
 *                         description: Indicates if the wishlist is public
 *                       expiresAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-11-08T00:00:00.000Z"
 *                         description: The expiration date of the wishlist
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                         example: "09127216-c1a9-468e-9a96-d712ab67edd9"
 *                         description: The ID of the user who created the wishlist
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-07T04:08:05.299Z"
 *                         description: Timestamp when the wishlist was created
 *                 message:
 *                   type: string
 *                   example: "Wishlist created successfully with items"
 *                   description: Confirmation message, varies based on whether items were included
 *       400:
 *         description: Bad Request - Missing required fields, past celebration date, or invalid items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Celebration event and date are required"
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Please log in to create a wishlist"
 *       404:
 *         description: Not Found - Curated item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Curated item with ID aecccb23-4d66-40f9-9849-2600c85fe3b1 not found"
 *       500:
 *         description: Internal Server Error - Failed to create wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Failed to create wishlist"
 */
router.post('/create', wishlistController.createWishlist);
/**
 * @openapi
 * /wishlist/add-item:
 *   post:
 *     summary: Add items to an existing wishlist
 *     description: Adds one or more curated items to an existing wishlist specified by the wishlist ID. Only the authenticated user who owns the wishlist can add items. Each item must include a valid curated item ID, and the items are validated to ensure they exist before being added.
 *     tags:
 *       - Wishlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               wishlistId:
 *                 type: string
 *                 format: uuid
 *                 example: "e9988d8b-d9c6-4dc8-aaf1-5d8e284eeae6"
 *                 description: The unique identifier of the wishlist to add items to
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     curatedItemId:
 *                       type: string
 *                       format: uuid
 *                       example: "b8f9c140-4edb-4c34-a2af-cec9458e92e7"
 *                       description: The ID of the curated item to add to the wishlist
 *                 description: List of curated items to add to the wishlist
 *             required:
 *               - wishlistId
 *               - items
 *     responses:
 *       201:
 *         description: Items added to wishlist successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "3d3cf2a4-e217-49b6-b344-76a28c644f17"
 *                         description: The unique identifier of the wishlist item
 *                       name:
 *                         type: string
 *                         example: "Bluetooth Speaker"
 *                         description: The name of the wishlist item
 *                       imageUrl:
 *                         type: string
 *                         nullable: true
 *                         example: "https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12"
 *                         description: The URL of the wishlist item's image
 *                       price:
 *                         type: string
 *                         example: "59.99"
 *                         description: The price of the wishlist item
 *                       quantity:
 *                         type: integer
 *                         example: 1
 *                         description: The requested quantity of the wishlist item
 *                       quantityFulfilled:
 *                         type: integer
 *                         example: 0
 *                         description: The quantity of the wishlist item that has been fulfilled
 *                       amountContributed:
 *                         type: string
 *                         example: "0.00"
 *                         description: The total amount contributed towards the wishlist item
 *                       priority:
 *                         type: integer
 *                         example: 1
 *                         description: The priority order of the wishlist item
 *                       wishlistId:
 *                         type: string
 *                         format: uuid
 *                         example: "e9988d8b-d9c6-4dc8-aaf1-5d8e284eeae6"
 *                         description: The ID of the wishlist the item belongs to
 *                       curatedItemId:
 *                         type: string
 *                         format: uuid
 *                         example: "b8f9c140-4edb-4c34-a2af-cec9458e92e7"
 *                         description: The ID of the curated item
 *                       categoryId:
 *                         type: string
 *                         format: uuid
 *                         example: "9e104dd8-5455-4552-b8b8-0157352d3227"
 *                         description: The ID of the category to which the item belongs
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-07T06:16:10.875Z"
 *                         description: Timestamp when the wishlist item was created
 *                 message:
 *                   type: string
 *                   example: "Items added to wishlist successfully"
 *       400:
 *         description: Bad Request - Missing wishlist ID, invalid items array, or missing curated item ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Items array is required"
 *       401:
 *         description: Unauthorized - User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Please log in to add items to a wishlist"
 *       403:
 *         description: Forbidden - User is not authorized to modify the wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Unauthorized to modify this wishlist"
 *       404:
 *         description: Not Found - Wishlist or curated item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Wishlist not found"
 *       500:
 *         description: Internal Server Error - Failed to add items to wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Failed to add items to wishlist"
 */
router.post('/add-item', wishlistController.addItemsToWishlist);
/**
 * @openapi
 * /wishlist:
 *   get:
 *     summary: Retrieve a wishlist by its unique link
 *     description: Fetches a wishlist and its associated items using the provided unique link. The wishlist must be public and active. Increments the view count and logs the view with the visitor's IP address, user agent, and referrer.
 *     tags:
 *       - Wishlist
 *     parameters:
 *       - in: query
 *         name: uniqueLink
 *         schema:
 *           type: string
 *           example: "https://joygiver.com/birthday-WBNmhb"
 *         required: true
 *         description: The unique link of the wishlist to retrieve
 *     responses:
 *       200:
 *         description: Wishlist fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       wishlist:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             example: "a2f42667-ba47-42e2-a3bb-57403a9132be"
 *                             description: The unique identifier of the wishlist
 *                           celebrationEvent:
 *                             type: string
 *                             example: "Birthday"
 *                             description: The event associated with the wishlist
 *                           celebrationDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-10-31T23:00:00.000Z"
 *                             description: The date of the celebration event
 *                           uniqueLink:
 *                             type: string
 *                             example: "https://joygiver.com/birthday-WBNmhb"
 *                             description: The unique URL for accessing the wishlist
 *                           status:
 *                             type: string
 *                             example: "active"
 *                             description: The status of the wishlist
 *                           totalContributed:
 *                             type: string
 *                             example: "0.00"
 *                             description: The total amount contributed to the wishlist
 *                           contributorsCount:
 *                             type: integer
 *                             example: 0
 *                             description: The number of contributors to the wishlist
 *                           viewsCount:
 *                             type: integer
 *                             example: 1
 *                             description: The number of views of the wishlist
 *                           isPublic:
 *                             type: boolean
 *                             example: true
 *                             description: Indicates if the wishlist is public
 *                           expiresAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-11-08T00:00:00.000Z"
 *                             description: The expiration date of the wishlist
 *                           userId:
 *                             type: string
 *                             format: uuid
 *                             example: "09127216-c1a9-468e-9a96-d712ab67edd9"
 *                             description: The ID of the user who created the wishlist
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-10-07T04:05:40.192Z"
 *                             description: Timestamp when the wishlist was created
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                               example: "fe66ca27-9b5d-4d94-8008-3db8e1e810fe"
 *                               description: The unique identifier of the wishlist item
 *                             name:
 *                               type: string
 *                               example: "Casual Denim Jacket"
 *                               description: The name of the wishlist item
 *                             imageUrl:
 *                               type: string
 *                               nullable: true
 *                               example: "https://i.guim.co.uk/img/media/18badfc0b64b09f917fd14bbe47d73fd92feeb27/189_335_5080_3048/master/5080.jpg?width=1200&height=1200&quality=85&auto=format&fit=crop&s=1562112c7a64da36ae0a5e75075a0d12"
 *                               description: The URL of the wishlist item's image
 *                             price:
 *                               type: string
 *                               example: "85.00"
 *                               description: The price of the wishlist item
 *                             quantity:
 *                               type: integer
 *                               example: 1
 *                               description: The requested quantity of the wishlist item
 *                             quantityFulfilled:
 *                               type: integer
 *                               example: 0
 *                               description: The quantity of the wishlist item that has been fulfilled
 *                             amountContributed:
 *                               type: string
 *                               example: "0.00"
 *                               description: The total amount contributed towards the wishlist item
 *                             priority:
 *                               type: integer
 *                               example: 1
 *                               description: The priority order of the wishlist item
 *                             wishlistId:
 *                               type: string
 *                               format: uuid
 *                               example: "a2f42667-ba47-42e2-a3bb-57403a9132be"
 *                               description: The ID of the wishlist the item belongs to
 *                             curatedItemId:
 *                               type: string
 *                               format: uuid
 *                               example: "21af9187-2093-4ed0-b7ec-af694d550fe2"
 *                               description: The ID of the curated item
 *                             categoryId:
 *                               type: string
 *                               format: uuid
 *                               example: "17f1972c-231d-49f2-8988-5792a862d07c"
 *                               description: The ID of the category to which the item belongs
 *                             created_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-10-07T04:05:40.254Z"
 *                               description: Timestamp when the wishlist item was created
 *                 message:
 *                   type: string
 *                   example: "Wishlist fetched successfully"
 *       400:
 *         description: Bad Request - Missing unique link
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Unique link is required"
 *       403:
 *         description: Forbidden - Wishlist is not public or not active
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "This wishlist is not available"
 *       404:
 *         description: Not Found - Wishlist or items not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: "Wishlist not found"
 */
router.get('/', wishlistController.getWishlistByLink);

export { router as wishlistRouter };
