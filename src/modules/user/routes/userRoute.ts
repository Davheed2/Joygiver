import { userController } from '../controller';
import { protect } from '@/middlewares/protect';
import express from 'express';

const router = express.Router();

/**
 * @openapi
 * /user/sign-up:
 *   post:
 *     summary: Register a new user with email or phone
 *     description: Creates a new user account with the provided email, phone number, first name, last name, gender, and date of birth. Validates that either email or phone is provided, ensures the email or phone is unique, and requires gender. Sends a welcome email upon successful registration. The registration completion status is set based on whether all required fields are provided.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 nullable: true
 *                 example: "uchennadavid2404@gmail.com"
 *                 description: The user's email address
 *               firstName:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *                 description: The user's first name
 *               lastName:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *                 description: The user's last name
 *               phone:
 *                 type: string
 *                 nullable: true
 *                 example: ""
 *                 description: The user's phone number
 *               gender:
 *                 type: string
 *                 example: "male"
 *                 description: The user's gender
 *               dob:
 *                 type: string
 *                 nullable: true
 *                 example: ""
 *                 description: The user's date of birth
 *             required:
 *               - gender
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                         example: "09127216-c1a9-468e-9a96-d712ab67edd9"
 *                         description: The unique identifier of the user
 *                       email:
 *                         type: string
 *                         nullable: true
 *                         example: "uchennadavid2404@gmail.com"
 *                         description: The user's email address
 *                       firstName:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                         description: The user's first name
 *                       lastName:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                         description: The user's last name
 *                       phone:
 *                         type: string
 *                         nullable: true
 *                         example: ""
 *                         description: The user's phone number
 *                       photo:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                         description: URL or path to the user's profile photo
 *                       role:
 *                         type: string
 *                         example: "user"
 *                         description: The user's role
 *                       isRegistrationComplete:
 *                         type: boolean
 *                         example: false
 *                         description: Indicates if the user registration is complete
 *                       isSuspended:
 *                         type: boolean
 *                         example: false
 *                         description: Indicates if the user account is suspended
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                         description: Indicates if the user account is deleted
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-05T04:48:50.177Z"
 *                         description: Timestamp when the user account was created
 *                       gender:
 *                         type: string
 *                         example: "male"
 *                         description: The user's gender
 *                       dob:
 *                         type: string
 *                         nullable: true
 *                         example: ""
 *                         description: The user's date of birth
 *                 message:
 *                   type: string
 *                   example: "User created successfully"
 *       400:
 *         description: Bad Request - Missing email or phone number, or missing gender
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
 *                   example: "Either email or phone number is required"
 *       409:
 *         description: Conflict - User with the provided email or phone number already exists
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
 *                   example: "User with this email already exists"
 *       500:
 *         description: Internal Server Error - Failed to create user
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
 *                   example: "Failed to create user"
 */
router.post('/sign-up', userController.signUp);
/**
 * @openapi
 * /user/sign-in:
 *   post:
 *     summary: Sign in a user with email or phone
 *     description: Initiates the authentication process for a user by either email or phone number. Validates the user's existence, checks for account suspension or deletion, and prompts the user to request an OTP to complete the sign-in process.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 nullable: true
 *                 example: "uchennadavid2404@gmail.com"
 *                 description: The user's email address
 *               phone:
 *                 type: string
 *                 nullable: true
 *                 example: ""
 *                 description: The user's phone number
 *             anyOf:
 *               - required: [email]
 *               - required: [phone]
 *     responses:
 *       200:
 *         description: Sign-in initiated successfully, OTP request required
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
 *                         example: "09127216-c1a9-468e-9a96-d712ab67edd9"
 *                         description: The unique identifier of the user
 *                       email:
 *                         type: string
 *                         nullable: true
 *                         example: "uchennadavid2404@gmail.com"
 *                         description: The user's email address
 *                       firstName:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                         description: The user's first name
 *                       lastName:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                         description: The user's last name
 *                       phone:
 *                         type: string
 *                         nullable: true
 *                         example: ""
 *                         description: The user's phone number
 *                       photo:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                         description: URL or path to the user's profile photo
 *                       role:
 *                         type: string
 *                         example: "user"
 *                         description: The user's role
 *                       isRegistrationComplete:
 *                         type: boolean
 *                         example: false
 *                         description: Indicates if the user registration is complete
 *                       isSuspended:
 *                         type: boolean
 *                         example: false
 *                         description: Indicates if the user account is suspended
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                         description: Indicates if the user account is deleted
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-05T04:48:50.177Z"
 *                         description: Timestamp when the user account was created
 *                       gender:
 *                         type: string
 *                         example: "male"
 *                         description: The user's gender
 *                       dob:
 *                         type: string
 *                         nullable: true
 *                         example: ""
 *                         description: The user's date of birth
 *                 message:
 *                   type: string
 *                   example: "Please request OTP to complete sign in."
 *       401:
 *         description: Unauthorized - Incomplete login data or account is suspended
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
 *                   example: "Incomplete login data"
 *       404:
 *         description: Not Found - User or account not found
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
router.post('/sign-in', userController.signIn);
/**
 * @openapi
 * /user/send-otp:
 *   post:
 *     summary: Send OTP for user verification via email or phone
 *     description: Sends a one-time password (OTP) to the user's email or phone number. Validates the user's existence, checks for account suspension or deletion, and ensures OTP request limits are not exceeded. The OTP is sent via email or SMS based on the provided contact method.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 nullable: true
 *                 example: "uchennadavid2404@gmail.com"
 *                 description: The user's email address
 *               phone:
 *                 type: string
 *                 nullable: true
 *                 example: "08163534417"
 *                 description: The user's phone number
 *             anyOf:
 *               - required: [email]
 *               - required: [phone]
 *     responses:
 *       200:
 *         description: OTP sent successfully
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
 *                   example: "OTP sent. Please verify to continue."
 *                   description: Confirmation message indicating the OTP was sent
 *       400:
 *         description: Bad Request - Missing email or phone number, or no valid contact method
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
 *                   example: "Email or phone number is required"
 *       401:
 *         description: Unauthorized - Account is suspended
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
 *                   example: "Your account is currently suspended"
 *       404:
 *         description: Not Found - User or account not found
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
 *       429:
 *         description: Too Many Requests - Exceeded OTP request limit
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
 *                   example: "Too many OTP requests. Please try again in an hour."
 */
router.post('/send-otp', userController.sendOtp);
/**
 * @openapi
 * /user/verify-otp:
 *   post:
 *     summary: Verify OTP for user authentication via email or phone
 *     description: Verifies the one-time password (OTP) provided by the user to complete the authentication process using either their email or phone number. Validates the user's existence, checks the OTP, and ensures it is not expired. Upon successful verification, clears the OTP, updates user details, generates access and refresh tokens, sets them as cookies, and sends a login notification if applicable.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 nullable: true
 *                 example: "uchennadavid2404@gmail.com"
 *                 description: The user's email address
 *               phone:
 *                 type: string
 *                 nullable: true
 *                 example: ""
 *                 description: The user's phone number
 *               otp:
 *                 type: string
 *                 example: "123456"
 *                 description: The one-time password sent to the user
 *             anyOf:
 *               - required: [email, otp]
 *               - required: [phone, otp]
 *     responses:
 *       200:
 *         description: OTP verified successfully, tokens generated
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
 *                         example: "09127216-c1a9-468e-9a96-d712ab67edd9"
 *                         description: The unique identifier of the user
 *                       email:
 *                         type: string
 *                         nullable: true
 *                         example: "uchennadavid2404@gmail.com"
 *                         description: The user's email address
 *                       firstName:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                         description: The user's first name
 *                       lastName:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                         description: The user's last name
 *                       phone:
 *                         type: string
 *                         nullable: true
 *                         example: ""
 *                         description: The user's phone number
 *                       photo:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                         description: URL or path to the user's profile photo
 *                       role:
 *                         type: string
 *                         example: "user"
 *                         description: The user's role
 *                       isRegistrationComplete:
 *                         type: boolean
 *                         example: false
 *                         description: Indicates if the user registration is complete
 *                       isSuspended:
 *                         type: boolean
 *                         example: false
 *                         description: Indicates if the user account is suspended
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                         description: Indicates if the user account is deleted
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-05T04:48:50.177Z"
 *                         description: Timestamp when the user account was created
 *                       gender:
 *                         type: string
 *                         example: "male"
 *                         description: The user's gender
 *                       dob:
 *                         type: string
 *                         nullable: true
 *                         example: ""
 *                         description: The user's date of birth
 *                 message:
 *                   type: string
 *                   example: "OTP verified successfully"
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 example:
 *                   - "accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly"
 *                   - "refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly"
 *               description: Sets the access and refresh tokens as cookies
 *       400:
 *         description: Bad Request - Missing email/phone or OTP
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
 *                   example: "Email or phone number and OTP are required"
 *       401:
 *         description: Unauthorized - Invalid or expired OTP
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
 *                   example: "Invalid or expired OTP"
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
 *       500:
 *         description: Internal Server Error - Failed to retrieve updated user
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
 *                   example: "Failed to retrieve updated user"
 */
router.post('/verify-otp', userController.verifyOtp);

router.use(protect);
/**
 * @openapi
 * /user/sign-out:
 *   post:
 *     summary: Sign out a user
 *     description: Logs out the currently authenticated user by invalidating their token family (if a refresh token is provided) and clearing access and refresh token cookies. Requires the user to be authenticated.
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: Logout successful
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
 *                   example: "Logout successful"
 *                   description: Confirmation message indicating successful logout
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 example:
 *                   - "accessToken=expired; Path=/; HttpOnly; Max-Age=-1"
 *                   - "refreshToken=expired; Path=/; HttpOnly; Max-Age=-1"
 *               description: Clears the access and refresh tokens by setting expired cookies
 *       401:
 *         description: Unauthorized - User is not logged in
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
 *                   example: "You are not logged in"
 */
router.post('/sign-out', userController.signOut);
/**
 * @openapi
 * /user/sign-out-all:
 *   post:
 *     summary: Sign out user from all devices
 *     description: Logs out the currently authenticated user from all devices by invalidating all token families associated with the user and clearing access and refresh token cookies. Requires the user to be authenticated.
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: Logout from all devices successful
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
 *                   example: "Logout from all devices successful"
 *                   description: Confirmation message indicating successful logout from all devices
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 example:
 *                   - "accessToken=expired; Path=/; HttpOnly; Max-Age=-1"
 *                   - "refreshToken=expired; Path=/; HttpOnly; Max-Age=-1"
 *               description: Clears the access and refresh tokens by setting expired cookies
 *       401:
 *         description: Unauthorized - User is not logged in
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
 *                   example: "You are not logged in"
 */
router.post('/sign-out-all', userController.signOutFromAllDevices);
/**
 * @openapi
 * /user/profile:
 *   get:
 *     summary: Retrieve user profile
 *     description: Retrieves the profile information of the currently authenticated user. The endpoint validates the user's authentication, checks if the user exists in the database, and returns their profile details.
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
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
 *                         example: "3515368b-1c83-4fcf-b301-7db17bb7d0de"
 *                         description: The unique identifier of the user
 *                       email:
 *                         type: string
 *                         nullable: true
 *                         example: "uchennadavid2404@gmail.com"
 *                         description: The user's email address
 *                       phone:
 *                         type: string
 *                         nullable: true
 *                         example: "08163534417"
 *                         description: The user's phone number
 *                       firstName:
 *                         type: string
 *                         nullable: true
 *                         example: "David"
 *                         description: The user's first name
 *                       lastName:
 *                         type: string
 *                         nullable: true
 *                         example: "David"
 *                         description: The user's last name
 *                       photo:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                         description: URL or path to the user's profile photo
 *                       role:
 *                         type: string
 *                         example: "user"
 *                         description: The user's role
 *                       isSuspended:
 *                         type: boolean
 *                         example: false
 *                         description: Indicates if the user account is suspended
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                         description: Indicates if the user account is deleted
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-09-23T03:25:40.189Z"
 *                         description: Timestamp when the user account was created
 *                       isRegistrationComplete:
 *                         type: boolean
 *                         example: true
 *                         description: Indicates if the user registration is complete
 *                 message:
 *                   type: string
 *                   example: "Profile retrieved successfully"
 *       400:
 *         description: Bad Request - User not logged in
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
 *                   example: "Please log in again"
 *       404:
 *         description: Not Found - User does not exist
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
router.get('/profile', userController.getProfile);
/**
 * @openapi
 * /user/update:
 *   post:
 *     summary: Update authenticated user details
 *     description: Updates the details of the currently authenticated user, including email, first name, last name, date of birth, and phone number. Validates user authentication, checks for account suspension or deletion, and ensures the updated email or phone number does not already exist for another user. Updates the registration completion status if all required fields are provided.
 *     tags:
 *       - User
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 nullable: true
 *                 example: "uchennadavid2404@gmail.com"
 *                 description: The user's email address
 *               firstName:
 *                 type: string
 *                 nullable: true
 *                 example: "Dave"
 *                 description: The user's first name
 *               lastName:
 *                 type: string
 *                 nullable: true
 *                 example: "David"
 *                 description: The user's last name
 *               dob:
 *                 type: string
 *                 nullable: true
 *                 example: "2000-01-01"
 *                 description: The user's date of birth
 *               phone:
 *                 type: string
 *                 nullable: true
 *                 example: ""
 *                 description: The user's phone number
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                         example: "09127216-c1a9-468e-9a96-d712ab67edd9"
 *                         description: The unique identifier of the user
 *                       email:
 *                         type: string
 *                         nullable: true
 *                         example: "uchennadavid2404@gmail.com"
 *                         description: The user's email address
 *                       firstName:
 *                         type: string
 *                         nullable: true
 *                         example: "Dave"
 *                         description: The user's first name
 *                       lastName:
 *                         type: string
 *                         nullable: true
 *                         example: "David"
 *                         description: The user's last name
 *                       photo:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                         description: URL or path to the user's profile photo
 *                       role:
 *                         type: string
 *                         example: "user"
 *                         description: The user's role
 *                       isRegistrationComplete:
 *                         type: boolean
 *                         example: false
 *                         description: Indicates if the user registration is complete
 *                       isSuspended:
 *                         type: boolean
 *                         example: false
 *                         description: Indicates if the user account is suspended
 *                       isDeleted:
 *                         type: boolean
 *                         example: false
 *                         description: Indicates if the user account is deleted
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-05T04:48:50.177Z"
 *                         description: Timestamp when the user account was created
 *                       gender:
 *                         type: string
 *                         example: "male"
 *                         description: The user's gender
 *                       dob:
 *                         type: string
 *                         nullable: true
 *                         example: "2000-01-01"
 *                         description: The user's date of birth
 *                       phone:
 *                         type: string
 *                         nullable: true
 *                         example: ""
 *                         description: The user's phone number
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *       401:
 *         description: Unauthorized - Account is suspended
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
 *                   example: "Your account is currently suspended"
 *       404:
 *         description: Not Found - User or account not found
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
 *       409:
 *         description: Conflict - User with the provided email or phone number already exists
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
 *                   example: "User with this email already exists"
 *       500:
 *         description: Internal Server Error - Failed to update or retrieve user details
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
 *                   example: "Failed to update user details"
 */
router.post('/update', userController.updateUserDetails);

export { router as userRouter };
