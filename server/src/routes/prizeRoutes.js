import { Router } from 'express';
import {
  createPrizeController,
  getPrizesController,
  updatePrizeStatusController,
  deletePrizeController,
  updatePrizeController,
} from '../controllers/prizeController.js';
import { verifyAdminToken } from '../middleware/adminAuth.js';

const router = Router();

// POST /api/prize (protected)
router.post('/', verifyAdminToken, createPrizeController);

// GET /api/prize/public (public - for users to view prizes)
router.get('/public', getPrizesController);

// GET /api/prize (protected - for admin)
router.get('/', verifyAdminToken, getPrizesController);

// PATCH /api/prize/:prizeId/status (protected)
router.patch('/:prizeId/status', verifyAdminToken, updatePrizeStatusController);

// PUT /api/prize/:prizeId (protected) - update prize details
router.put('/:prizeId', verifyAdminToken, updatePrizeController);

// DELETE /api/prize/:prizeId (protected)
router.delete('/:prizeId', verifyAdminToken, deletePrizeController);

export default router;

