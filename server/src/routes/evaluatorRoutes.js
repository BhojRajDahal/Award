import { Router } from 'express';
import { loginEvaluator } from '../controllers/adminController.js';
import { getEvaluatorApplicationsController, getUserProfileForEvaluatorController } from '../controllers/applicationController.js';
import { verifyEvaluatorToken } from '../middleware/evaluatorAuth.js';
import { loginLimiterEvaluator } from '../middleware/rateLimiters.js';

const router = Router();

// Evaluator authentication
router.post('/login', loginLimiterEvaluator, loginEvaluator);

// Evaluator protected routes
router.get('/applications', verifyEvaluatorToken, getEvaluatorApplicationsController);
router.get('/user/:user_id/profile', verifyEvaluatorToken, getUserProfileForEvaluatorController);

export default router;

