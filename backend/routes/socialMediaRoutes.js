import express from 'express';
import { getSocialMedia, createSocialMedia, updateSocialMedia, deleteSocialMedia } from '../controllers/socialMediaController.js';

const router = express.Router();

router.route('/')
  .get(getSocialMedia)
  .post(createSocialMedia);

router.route('/:id')
  .put(updateSocialMedia)
  .delete(deleteSocialMedia);

export default router;
