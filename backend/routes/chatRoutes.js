import express from 'express';
import { handleChat } from '../controllers/chatController.js';
import { populateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Use populateUser to identify logged-in users while keeping the route public
router.post('/', populateUser, handleChat);

export default router;
