import express from 'express';
import { getWebsiteContent, scrapeWebsite, getWebsiteNavigation, getWebsiteStats } from '../controllers/websiteController.js';

const router = express.Router();

// Get website content based on query
router.get('/website-content', getWebsiteContent);

// Scrape website for specific content
router.get('/scrape-website', scrapeWebsite);

// Get website navigation structure
router.get('/website-navigation', getWebsiteNavigation);

// Get global stats
router.get('/stats', getWebsiteStats);

export default router;
