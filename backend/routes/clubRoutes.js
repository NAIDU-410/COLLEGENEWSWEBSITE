import express from 'express';
import multer from 'multer';
import path from 'path';
import {
    getEvents as getClubEventsCentral,
    getEventById as getClubEventByIdCentral,
    createEvent as createClubEventCentral,
    updateEvent as updateClubEventCentral,
    deleteEvent as deleteClubEventCentral
} from '../controllers/eventController.js';
import {
    getClubTypes,
    createClubType,
    updateClubType,
    deleteClubType
} from '../controllers/clubController.js';

const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/clubs/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// Category Management (Root)
router.get('/', getClubTypes);
router.route('/types')
    .get(getClubTypes)
    .post(upload.single('image'), createClubType);

router.route('/types/:id')
    .put(upload.single('image'), updateClubType)
    .delete(deleteClubType);

// Club Events
router.route('/events')
    .get((req, res, next) => {
        req.query.type = 'clubs';
        getClubEventsCentral(req, res, next);
    })
    .post(upload.fields([
        { name: 'eventImage', maxCount: 1 },
        { name: 'images', maxCount: 10 }
    ]), createClubEventCentral);

router.route('/events/:id')
    .get(getClubEventByIdCentral)
    .put(upload.fields([
        { name: 'eventImage', maxCount: 1 },
        { name: 'images', maxCount: 10 }
    ]), updateClubEventCentral)
    .delete(deleteClubEventCentral);

export default router;
