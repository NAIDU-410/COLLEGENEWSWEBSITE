import express from 'express';
const router = express.Router();
import { getCarousels, createCarousel, updateCarousel, deleteCarousel } from '../controllers/homeCarouselController.js';
import upload from '../utils/upload.js';

router.get('/', getCarousels);
router.post('/', upload.single('image'), createCarousel);
router.put('/:id', upload.single('image'), updateCarousel);
router.delete('/:id', deleteCarousel);

export default router;
