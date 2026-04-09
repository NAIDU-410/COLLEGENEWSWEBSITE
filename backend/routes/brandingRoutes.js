import express from 'express';
import { getBranding, updateBranding } from '../controllers/brandingController.js';

const router = express.Router();

router.get('/', getBranding);
router.put('/', updateBranding);

export default router;
