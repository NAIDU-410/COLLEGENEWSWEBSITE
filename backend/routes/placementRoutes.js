import express from 'express';
import {
  createPlacement,
  getPlacements,
  getSinglePlacement,
  updatePlacement,
  deletePlacement
} from '../controllers/placementController.js';
import upload from '../utils/upload.js';
import { protect, admin, studentOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, studentOrAdmin, getPlacements)
  .post(protect, admin, upload.single('logo'), createPlacement);

router.route('/:id')
  .get(protect, studentOrAdmin, getSinglePlacement)
  .put(protect, admin, upload.single('logo'), updatePlacement)
  .delete(protect, admin, deletePlacement);

export default router;
