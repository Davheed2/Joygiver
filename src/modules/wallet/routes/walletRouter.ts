import { payoutController, walletController } from '../controller';
import { protect } from '@/middlewares/protect';
import express from 'express';

const router = express.Router();
router.use(protect);

// ==================== WALLET ROUTES ====================
/**
 * @openapi
 * /wallet/user:
 *   get:
 *     summary: Retrieve or create user wallet
 *     description: Fetches the wallet for the authenticated user. If no wallet exists for the user, a new wallet is created with initial balances set to zero. Requires user authentication.
 *     tags:
 *       - Wallet
 *     responses:
 *       201:
 *         description: Wallet retrieved or created successfully
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
 *                         example: "f8a12d2f-7e7b-484c-b0e4-d2839c459027"
 *                         description: The unique identifier of the wallet
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                         example: "09127216-c1a9-468e-9a96-d712ab67edd9"
 *                         description: The ID of the user associated with the wallet
 *                       availableBalance:
 *                         type: string
 *                         example: "0.00"
 *                         description: The available balance in the wallet
 *                       pendingBalance:
 *                         type: string
 *                         example: "0.00"
 *                         description: The pending balance in the wallet
 *                       totalReceived:
 *                         type: string
 *                         example: "0.00"
 *                         description: The total amount received in the wallet
 *                       totalWithdrawn:
 *                         type: string
 *                         example: "0.00"
 *                         description: The total amount withdrawn from the wallet
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-10T09:45:53.611Z"
 *                         description: Timestamp when the wallet was created
 *                 message:
 *                   type: string
 *                   example: "Wallet created successfully"
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
 *                   example: "Please log in to create a wallet"
 */
router.get('/user', walletController.getUserWallet);
/**
 * @openapi
 * /wallet/summary:
 *   get:
 *     summary: Retrieve user wallet summary
 *     description: Fetches a comprehensive summary of the authenticated user's wallet, including wallet details, payout methods, the number of unique contributors, and the total number of wishlist items. Requires user authentication.
 *     tags:
 *       - Wallet
 *     responses:
 *       200:
 *         description: Wallet summary retrieved successfully
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
 *                       wallet:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             example: "f8a12d2f-7e7b-484c-b0e4-d2839c459027"
 *                             description: The unique identifier of the wallet
 *                           userId:
 *                             type: string
 *                             format: uuid
 *                             example: "09127216-c1a9-468e-9a96-d712ab67edd9"
 *                             description: The ID of the user associated with the wallet
 *                           availableBalance:
 *                             type: string
 *                             example: "0.00"
 *                             description: The available balance in the wallet
 *                           pendingBalance:
 *                             type: string
 *                             example: "0.00"
 *                             description: The pending balance in the wallet
 *                           totalReceived:
 *                             type: string
 *                             example: "0.00"
 *                             description: The total amount received in the wallet
 *                           totalWithdrawn:
 *                             type: string
 *                             example: "0.00"
 *                             description: The total amount withdrawn from the wallet
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-10-10T09:45:53.611Z"
 *                             description: Timestamp when the wallet was created
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-10-10T09:45:53.611Z"
 *                             description: Timestamp when the wallet was last updated
 *                       payoutMethods:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                               example: "73961b36-d31f-4797-95f6-7c8aca98d2e3"
 *                               description: The unique identifier of the payout method
 *                             userId:
 *                               type: string
 *                               format: uuid
 *                               example: "09127216-c1a9-468e-9a96-d712ab67edd9"
 *                               description: The ID of the user associated with the payout method
 *                             accountName:
 *                               type: string
 *                               example: "UCHENNA DAVID OKONKWO"
 *                               description: The name associated with the bank account
 *                             accountNumber:
 *                               type: string
 *                               example: "2403016646"
 *                               description: The bank account number
 *                             bankName:
 *                               type: string
 *                               example: "Zenith Bank"
 *                               description: The name of the bank
 *                             bankCode:
 *                               type: string
 *                               example: "057"
 *                               description: The code of the bank
 *                             bvn:
 *                               type: string
 *                               nullable: true
 *                               example: null
 *                               description: The Bank Verification Number (if provided)
 *                             recipientCode:
 *                               type: string
 *                               example: "RCP_ldux2s94ug8ug8k"
 *                               description: The recipient code generated by the Paystack service
 *                             isVerified:
 *                               type: boolean
 *                               example: true
 *                               description: Indicates if the payout method has been verified
 *                             isPrimary:
 *                               type: boolean
 *                               example: true
 *                               description: Indicates if this is the primary payout method
 *                             created_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-10-10T10:33:52.771Z"
 *                               description: Timestamp when the payout method was created
 *                             updated_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-10-10T10:48:34.305Z"
 *                               description: Timestamp when the payout method was last updated
 *                       contributorsCount:
 *                         type: integer
 *                         example: 0
 *                         description: The number of unique contributors to the user's wishlists
 *                       wishlistItemsCount:
 *                         type: integer
 *                         example: 16
 *                         description: The total number of items in the user's wishlists
 *                 message:
 *                   type: string
 *                   example: "Wallet summary retrieved successfully"
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
 *                   example: "Please log in to view your wallet"
 *       404:
 *         description: Not Found - Wallet summary not found
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
 *                   example: "Wallet summary not found"
 */
router.get('/summary', walletController.getWalletSummary);
router.get('/transactions', walletController.getTransactionHistory);

// ==================== PAYOUT METHOD ROUTES ====================
/**
 * @openapi
 * /wallet/banks:
 *   get:
 *     summary: Retrieve list of banks
 *     description: Fetches a list of banks available through the Paystack service. Users can optionally filter banks by name or bank code using the search query parameter. Requires user authentication.
 *     tags:
 *       - Wallet
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: "Guaranty Trust Bank"
 *         description: Optional search term to filter banks by name or bank code
 *     responses:
 *       200:
 *         description: Banks retrieved successfully
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
 *                         type: integer
 *                         example: 9
 *                         description: The unique identifier of the bank
 *                       name:
 *                         type: string
 *                         example: "Guaranty Trust Bank"
 *                         description: The name of the bank
 *                       slug:
 *                         type: string
 *                         example: "guaranty-trust-bank"
 *                         description: The slugified name of the bank
 *                       code:
 *                         type: string
 *                         example: "058"
 *                         description: The bank code
 *                       longcode:
 *                         type: string
 *                         example: "058152036"
 *                         description: The long code for the bank
 *                       gateway:
 *                         type: string
 *                         example: "ibank"
 *                         description: The payment gateway used by the bank
 *                       pay_with_bank:
 *                         type: boolean
 *                         example: false
 *                         description: Indicates if direct bank payment is supported
 *                       supports_transfer:
 *                         type: boolean
 *                         example: true
 *                         description: Indicates if the bank supports transfers
 *                       available_for_direct_debit:
 *                         type: boolean
 *                         example: true
 *                         description: Indicates if the bank is available for direct debit
 *                       active:
 *                         type: boolean
 *                         example: true
 *                         description: Indicates if the bank is active
 *                       country:
 *                         type: string
 *                         example: "Nigeria"
 *                         description: The country where the bank operates
 *                       currency:
 *                         type: string
 *                         example: "NGN"
 *                         description: The currency supported by the bank
 *                       type:
 *                         type: string
 *                         example: "nuban"
 *                         description: The type of bank account number format
 *                       is_deleted:
 *                         type: boolean
 *                         example: false
 *                         description: Indicates if the bank has been deleted
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2016-07-14T10:04:29.000Z"
 *                         description: Timestamp when the bank record was created
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-11-14T12:30:43.000Z"
 *                         description: Timestamp when the bank record was last updated
 *                 message:
 *                   type: string
 *                   example: "Banks retrieved successfully"
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
 *                   example: "Please log in to view banks"
 *       500:
 *         description: Internal Server Error - Failed to retrieve banks
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
 *                   example: "Failed to retrieve banks"
 */
router.get('/banks', payoutController.getBanks);
/**
 * @openapi
 * /wallet/verify-account:
 *   post:
 *     summary: Verify a bank account number
 *     description: Verifies a bank account number using the provided account number and bank code. Requires user authentication.
 *     tags:
 *       - Wallet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountNumber:
 *                 type: string
 *                 example: "2403016646"
 *                 description: The bank account number to verify
 *               bankCode:
 *                 type: string
 *                 example: "058"
 *                 description: The code of the bank associated with the account
 *             required:
 *               - accountNumber
 *               - bankCode
 *     responses:
 *       200:
 *         description: Account verified successfully
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
 *                       account_number:
 *                         type: string
 *                         example: "2403016646"
 *                         description: The verified bank account number
 *                       account_name:
 *                         type: string
 *                         example: "UCHENNA DAVID OKONKWO"
 *                         description: The name associated with the bank account
 *                       bank_id:
 *                         type: integer
 *                         example: 21
 *                         description: The unique identifier of the bank
 *                 message:
 *                   type: string
 *                   example: "Account verified successfully"
 *       400:
 *         description: Bad Request - Missing account number or bank code, or verification failed
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
 *                   example: "Account number and bank code are required"
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
 *                   example: "Please log in to verify account"
 */
router.post('/verify-account', payoutController.verifyAccountNumber);
/**
 * @openapi
 * /wallet/payout-methods:
 *   post:
 *     summary: Add a new payout method
 *     description: Adds a new payout method for the authenticated user by verifying the provided account number and bank code using the Paystack service. Ensures the account does not already exist for the user and optionally sets the payout method as primary. If set as primary, unsets other primary payout methods for the user.
 *     tags:
 *       - Wallet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountNumber:
 *                 type: string
 *                 example: "2403016646"
 *                 description: The bank account number to add as a payout method
 *               bankCode:
 *                 type: string
 *                 example: "057"
 *                 description: The code of the bank associated with the account
 *               isPrimary:
 *                 type: boolean
 *                 example: true
 *                 description: Indicates if this payout method should be set as the primary method
 *             required:
 *               - accountNumber
 *               - bankCode
 *     responses:
 *       201:
 *         description: Payout method added successfully
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
 *                         example: "73961b36-d31f-4797-95f6-7c8aca98d2e3"
 *                         description: The unique identifier of the payout method
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                         example: "09127216-c1a9-468e-9a96-d712ab67edd9"
 *                         description: The ID of the user associated with the payout method
 *                       accountName:
 *                         type: string
 *                         example: "UCHENNA DAVID OKONKWO"
 *                         description: The name associated with the bank account
 *                       accountNumber:
 *                         type: string
 *                         example: "2403016646"
 *                         description: The bank account number
 *                       bankName:
 *                         type: string
 *                         example: "Zenith Bank"
 *                         description: The name of the bank
 *                       bankCode:
 *                         type: string
 *                         example: "057"
 *                         description: The code of the bank
 *                       bvn:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                         description: The Bank Verification Number (if provided)
 *                       recipientCode:
 *                         type: string
 *                         example: "RCP_ldux2s94ug8ug8k"
 *                         description: The recipient code generated by the Paystack service
 *                       isVerified:
 *                         type: boolean
 *                         example: true
 *                         description: Indicates if the payout method has been verified
 *                       isPrimary:
 *                         type: boolean
 *                         example: true
 *                         description: Indicates if this is the primary payout method
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-10T10:33:52.771Z"
 *                         description: Timestamp when the payout method was created
 *                 message:
 *                   type: string
 *                   example: "Payout method added successfully"
 *       400:
 *         description: Bad Request - Missing account number or bank code, account already exists, or verification failed
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
 *                   example: "Account number and bank code are required"
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
 *                   example: "Please log in to add a payout method"
 */
router.post('/payout-method', payoutController.addPayoutMethod);
/**
 * @openapi
 * /wallet/payout-method:
 *   get:
 *     summary: Retrieve user payout methods
 *     description: Fetches all payout methods associated with the authenticated user. Requires user authentication.
 *     tags:
 *       - Wallet
 *     responses:
 *       200:
 *         description: Payout methods retrieved successfully
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
 *                         example: "73961b36-d31f-4797-95f6-7c8aca98d2e3"
 *                         description: The unique identifier of the payout method
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                         example: "09127216-c1a9-468e-9a96-d712ab67edd9"
 *                         description: The ID of the user associated with the payout method
 *                       accountName:
 *                         type: string
 *                         example: "UCHENNA DAVID OKONKWO"
 *                         description: The name associated with the bank account
 *                       accountNumber:
 *                         type: string
 *                         example: "2403016646"
 *                         description: The bank account number
 *                       bankName:
 *                         type: string
 *                         example: "Zenith Bank"
 *                         description: The name of the bank
 *                       bankCode:
 *                         type: string
 *                         example: "057"
 *                         description: The code of the bank
 *                       bvn:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                         description: The Bank Verification Number (if provided)
 *                       recipientCode:
 *                         type: string
 *                         example: "RCP_ldux2s94ug8ug8k"
 *                         description: The recipient code generated by the Paystack service
 *                       isVerified:
 *                         type: boolean
 *                         example: true
 *                         description: Indicates if the payout method has been verified
 *                       isPrimary:
 *                         type: boolean
 *                         example: true
 *                         description: Indicates if this is the primary payout method
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-10T10:33:52.771Z"
 *                         description: Timestamp when the payout method was created
 *                 message:
 *                   type: string
 *                   example: "Payout methods retrieved successfully"
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
 *                   example: "Please log in to view payout methods"
 */
router.get('/payout-method', payoutController.getPayoutMethods);
/**
 * @openapi
 * /wallet/primary/payout-method:
 *   post:
 *     summary: Set a payout method as primary
 *     description: Sets the specified payout method as the primary method for the authenticated user. Unsets any existing primary payout method for the user before setting the new one. Requires user authentication and the payout method must belong to the user.
 *     tags:
 *       - Wallet
 *     parameters:
 *       - in: query
 *         name: payoutMethodId
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "73961b36-d31f-4797-95f6-7c8aca98d2e3"
 *         required: true
 *         description: The unique identifier of the payout method to set as primary
 *     responses:
 *       200:
 *         description: Primary payout method updated successfully
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
 *                         example: "73961b36-d31f-4797-95f6-7c8aca98d2e3"
 *                         description: The unique identifier of the payout method
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                         example: "09127216-c1a9-468e-9a96-d712ab67edd9"
 *                         description: The ID of the user associated with the payout method
 *                       accountName:
 *                         type: string
 *                         example: "UCHENNA DAVID OKONKWO"
 *                         description: The name associated with the bank account
 *                       accountNumber:
 *                         type: string
 *                         example: "2403016646"
 *                         description: The bank account number
 *                       bankName:
 *                         type: string
 *                         example: "Zenith Bank"
 *                         description: The name of the bank
 *                       bankCode:
 *                         type: string
 *                         example: "057"
 *                         description: The code of the bank
 *                       bvn:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                         description: The Bank Verification Number (if provided)
 *                       recipientCode:
 *                         type: string
 *                         example: "RCP_ldux2s94ug8ug8k"
 *                         description: The recipient code generated by the Paystack service
 *                       isVerified:
 *                         type: boolean
 *                         example: true
 *                         description: Indicates if the payout method has been verified
 *                       isPrimary:
 *                         type: boolean
 *                         example: true
 *                         description: Indicates if this is the primary payout method
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-10T10:33:52.771Z"
 *                         description: Timestamp when the payout method was created
 *                 message:
 *                   type: string
 *                   example: "Primary payout method updated successfully"
 *       400:
 *         description: Bad Request - Missing payout method ID
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
 *                   example: "Payout method ID is required"
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
 *                   example: "Please log in"
 *       403:
 *         description: Forbidden - User not authorized to modify the payout method
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
 *                   example: "Unauthorized"
 *       404:
 *         description: Not Found - Payout method not found
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
 *                   example: "Payout method not found"
 */
router.post('/primary/payout-method', payoutController.setPrimaryPayoutMethod);
/**
 * @openapi
 * /wallet/remove/payout-method:
 *   post:
 *     summary: Delete a payout method
 *     description: Deletes a specified payout method for the authenticated user. Ensures the payout method belongs to the user and has no pending or processing withdrawal requests. Requires user authentication.
 *     tags:
 *       - Wallet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payoutMethodId:
 *                 type: string
 *                 format: uuid
 *                 example: "73961b36-d31f-4797-95f6-7c8aca98d2e3"
 *                 description: The unique identifier of the payout method to delete
 *             required:
 *               - payoutMethodId
 *     responses:
 *       200:
 *         description: Payout method deleted successfully
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
 *                   example: "Payout method deleted successfully"
 *       400:
 *         description: Bad Request - Missing payout method ID or pending withdrawals exist
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
 *                   example: "Payout method ID is required"
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
 *                   example: "Please log in"
 *       403:
 *         description: Forbidden - User not authorized to delete the payout method
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
 *                   example: "Unauthorized"
 *       404:
 *         description: Not Found - Payout method not found
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
 *                   example: "Payout method not found"
 */
router.post('/remove/payout-method', payoutController.deletePayoutMethod);

// // ==================== WITHDRAWAL ROUTES ====================
// router.post(
// 	'/withdrawals',
// 	authenticate,
// 	validateRequest(walletModuleSchema),
// 	walletController.createWithdrawal
// );

// router.get(
// 	'/withdrawals',
// 	authenticate,
// 	validateRequest(walletModuleSchema),
// 	walletController.getWithdrawalHistory
// );

// router.get(
// 	'/withdrawals/:withdrawalId',
// 	authenticate,
// 	walletController.getWithdrawalDetails
// );

// // ==================== ADMIN ROUTES ====================
// router.post(
// 	'/admin/withdrawals/:withdrawalId/process',
// 	authenticate,
// 	walletController.processWithdrawal
// );

// router.post(
// 	'/admin/withdrawals/:withdrawalId/complete',
// 	authenticate,
// 	walletController.completeWithdrawal
// );

// router.post(
// 	'/admin/withdrawals/:withdrawalId/fail',
// 	authenticate,
// 	validateRequest(walletModuleSchema),
// 	walletController.failWithdrawal
// );

export { router as walletRouter };
