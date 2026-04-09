import express from 'express';
import {
  createAchievement,
  getAchievements,
  getAchievementById,
  updateAchievement,
  deleteAchievement
} from '../controllers/achievementController.js';
import upload from '../utils/upload.js';

const router = express.Router();

router.route('/')
  .get(getAchievements)
  .post(
    upload.fields([
      { name: 'cardImage', maxCount: 1 },
      { name: 'detailImage', maxCount: 1 }
    ]),
    createAchievement
  );

router.route('/:id')
  .get(getAchievementById)
  .put(
    upload.fields([
      { name: 'cardImage', maxCount: 1 },
      { name: 'detailImage', maxCount: 1 }
    ]),
    updateAchievement
  )
  .delete(deleteAchievement);

export default router;
