import express from 'express';
import {
    getExams,
    getExamById,
    createExam,
    updateExam,
    deleteExam
} from '../controllers/examController.js';
import upload from '../utils/upload.js';
import { protect, admin, studentOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, studentOrAdmin, getExams)
    .post(protect, admin, upload.single('image'), createExam);

router.route('/:id')
    .get(protect, studentOrAdmin, getExamById)
    .put(protect, admin, upload.single('image'), updateExam)
    .delete(protect, admin, deleteExam);

export default router;
