import { deviceTokenController, notificationController } from '../controller';
import { protect } from '@/middlewares/protect';
import express from 'express';

const router = express.Router();

router.use(protect);

router.post('/add/device-token', deviceTokenController.saveToken);
// Get user's devices
router.get('/device-tokens', deviceTokenController.getUserDevices);
router.post('/remove/device-token', deviceTokenController.deleteToken);
// Deactivate device token
router.patch('/deactivate', deviceTokenController.deactivateToken);
// Clean up old inactive tokens
router.post('/device-tokens/cleanup', deviceTokenController.cleanupTokens);

// Send notification to a user
router.post('/notifications/user', notificationController.notifyUser);
// Send notification to multiple users
router.post('/notifications/users', notificationController.notifyMultipleUsers);

export { router as notificationRouter };
