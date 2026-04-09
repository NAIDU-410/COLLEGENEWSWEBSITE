import express from 'express';
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getAdmins)
  .post(protect, admin, createAdmin);

router.route('/:id')
  .put(protect, admin, updateAdmin)
  .delete(protect, admin, deleteAdmin);

export default router;
