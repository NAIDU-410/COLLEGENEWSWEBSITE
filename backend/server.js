import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';

// Configure dotenv before importing other modules
dotenv.config();

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import placementRoutes from './routes/placementRoutes.js';
import examRoutes from './routes/examRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import sportRoutes from './routes/sportRoutes.js';
import clubRoutes from './routes/clubRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import homeCarouselRoutes from './routes/homeCarouselRoutes.js';
import footerRoutes from './routes/footerRoutes.js';
import socialMediaRoutes from './routes/socialMediaRoutes.js';
import brandingRoutes from './routes/brandingRoutes.js';
import websiteRoutes from './routes/websiteRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://*", "http://*", "blob:"],
      connectSrc: ["'self'", "https://*", "http://*"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/sports', sportRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/home-carousel', homeCarouselRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/social-media', socialMediaRoutes);
app.use('/api/branding', brandingRoutes);
app.use('/api', websiteRoutes);

// SSOT Category Aliases
import { getSportTypes, createSportType, updateSportType, deleteSportType } from './controllers/sportController.js';
import { getClubTypes, createClubType, updateClubType, deleteClubType } from './controllers/clubController.js';
import upload from './utils/upload.js'; // Base upload util

app.get('/api/sport-types', getSportTypes);
app.post('/api/sport-types', upload.single('image'), createSportType);
app.put('/api/sport-types/:id', upload.single('image'), updateSportType);
app.delete('/api/sport-types/:id', deleteSportType);

app.get('/api/club-types', getClubTypes);
app.post('/api/club-types', upload.single('image'), createClubType);
app.put('/api/club-types/:id', upload.single('image'), updateClubType);
app.delete('/api/club-types/:id', deleteClubType);

// Branding Upload Helper
import { updateBranding } from './controllers/brandingController.js';
import { fileToBase64 } from './utils/fileUtils.js';
app.put('/api/branding/upload', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'navbarLogo', maxCount: 1 },
  { name: 'heroLogo', maxCount: 1 }
]), async (req, res) => {
  try {
    const updateData = {};
    if (req.files['logo']) updateData.logo = await fileToBase64(req.files['logo'][0].path);
    if (req.files['navbarLogo']) updateData.navbarLogo = await fileToBase64(req.files['navbarLogo'][0].path);
    if (req.files['heroLogo']) updateData.heroLogo = await fileToBase64(req.files['heroLogo'][0].path);
    
    req.body = { ...req.body, ...updateData };
    return updateBranding(req, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register the chat functionality
app.use('/api/chat', chatRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', message: 'Backend server is running' });
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(
      PORT,
      '0.0.0.0',
      () => console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      )
    );
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

