import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
    getEvents as getSportEventsCentral, 
    createEvent as createSportEventCentral, 
    updateEvent as updateSportEventCentral, 
    getEventById as getSportEventByIdCentral,
    deleteEvent as deleteSportEventCentral
} from '../controllers/eventController.js';
import {
    getSportTypes,
    createSportType,
    updateSportType,
    deleteSportType,
    getSportAchievements,
    createSportAchievement,
    deleteSportAchievement
} from '../controllers/sportController.js';

const router = express.Router();

// Multer Config for Sports Media
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/sports/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Category Management (Root)
router.get('/', getSportTypes);

// Sport Events
router.get('/events', (req, res, next) => {
    req.query.type = 'sports';
    getSportEventsCentral(req, res, next);
});
router.post('/events', upload.fields([
    { name: 'eventImage', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]), createSportEventCentral);
router.get('/events/:id', getSportEventByIdCentral);
router.put('/events/:id', upload.fields([
    { name: 'eventImage', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]), updateSportEventCentral);
router.delete('/events/:id', deleteSportEventCentral);

// Sport Types
router.get('/types', getSportTypes);
router.post('/types', upload.single('image'), createSportType);
router.put('/types/:id', upload.single('image'), updateSportType);
router.delete('/types/:id', deleteSportType);

// Achievements
router.get('/achievements', getSportAchievements);
router.post('/achievements', createSportAchievement);
router.delete('/achievements/:id', deleteSportAchievement);

export default router;
