import { Router } from 'express';
import { getCurrentSession, loginUser, logoutSession, refreshSession, registerUser } from '../controllers/authController.js';
import { forgotPasswordController, resetPasswordController } from '../controllers/passwordResetController.js';
import { forgotPasswordLimiter, loginLimiterAuth, passwordResetAttemptLimiter } from '../middleware/rateLimiters.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginLimiterAuth, loginUser);
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordController);
router.post('/reset-password', passwordResetAttemptLimiter, resetPasswordController);
router.post('/refresh', refreshSession);
router.post('/logout', logoutSession);
router.get('/me', getCurrentSession);

export default router;
