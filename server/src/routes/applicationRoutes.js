import { Router } from 'express';
import {
    // Field endpoints (public)
    getCommonFieldsController,
    getPrizeSpecificFieldsController,
    // Application endpoints
    submitApplicationController,
    getAllApplicationsController,
    getApplicationByIdController,
    getApplicationsByUserIdController,
    getApplicationsByPrizeIdController,
    updateApplicationStatusController,
    getUserProfileController,
    sendCustomEmailController,
    // Mark endpoints
    assignMarksController,
    getMarksByApplicationIdController,
} from '../controllers/applicationController.js';
import { verifyAdminToken } from '../middleware/adminAuth.js';
import { verifyToken } from '../middleware/auth.js';
import { getUploadMiddleware } from '../middleware/upload.js';
import { requireApplicationOwnership } from '../middleware/rbac.js';

const router = Router();

// ============================================
// PUBLIC ROUTES - Field endpoints (no auth needed)
// ============================================
// IMPORTANT: These routes must come BEFORE catch-all routes

// Get all common fields (NO prize_id needed - same for all prizes)
router.get('/common-fields', getCommonFieldsController);

// Get prize-specific fields for a specific prize (requires prize_id)
router.get('/prize/:prize_id/specific-fields', getPrizeSpecificFieldsController);

// ============================================
// USER ROUTES (protected with user token)
// ============================================
router.post('/submit', verifyToken, getUploadMiddleware(), submitApplicationController);
router.get('/my-applications', verifyToken, getApplicationsByUserIdController);

// ============================================
// ADMIN ROUTES (protected with admin token)
// ============================================
// Specific routes first (before catch-all)
router.get('/user/:user_id/profile', verifyAdminToken, getUserProfileController);
router.get('/prize/:prize_id', verifyAdminToken, getApplicationsByPrizeIdController);
router.get('/', verifyAdminToken, getAllApplicationsController);
router.patch('/:application_id/status', verifyAdminToken, updateApplicationStatusController);
router.post('/:application_id/send-email', verifyAdminToken, sendCustomEmailController);
router.post('/:application_id/marks', verifyAdminToken, assignMarksController);
router.get('/:application_id/marks', verifyAdminToken, getMarksByApplicationIdController);

// ============================================
// USER ROUTES (protected with user token) - Must come after admin routes
// ============================================
router.get('/:application_id', verifyToken, requireApplicationOwnership, getApplicationByIdController);

export default router;

