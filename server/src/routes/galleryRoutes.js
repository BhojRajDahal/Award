import { Router } from 'express';
import {
    getAllGalleryItemsController,
    getGalleryItemByIdController,
} from '../controllers/galleryController.js';

const router = Router();

// Public route - get all gallery items
router.get('/public', getAllGalleryItemsController);

// Public route - get gallery item by ID
router.get('/public/:gallery_id', getGalleryItemByIdController);

export default router;

