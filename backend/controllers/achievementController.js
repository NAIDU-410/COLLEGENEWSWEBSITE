import Achievement from '../models/Achievement.js';
import asyncHandler from 'express-async-handler';
import { fileToBase64 } from '../utils/fileUtils.js';

// @desc    Get all achievements (with optional filtering by type/subcategory and limit for carousel)
// @route   GET /api/achievements
// @access  Public
export const getAchievements = asyncHandler(async (req, res) => {
    const { type, subcategory, limit } = req.query;
    let query = {};

    if (type) query.type = type;
    if (subcategory) query.subcategory = subcategory.toLowerCase().trim();

    let mongooseQuery = Achievement.find(query).sort({ createdAt: -1 });
    
    if (limit) {
        mongooseQuery = mongooseQuery.limit(parseInt(limit, 10));
    }

    const achievements = await mongooseQuery;
    res.json(achievements);
});

// @desc    Get single achievement by ID
// @route   GET /api/achievements/:id
// @access  Public
export const getAchievementById = asyncHandler(async (req, res) => {
    const achievement = await Achievement.findById(req.params.id);
    if (achievement) {
        res.json(achievement);
    } else {
        res.status(404);
        throw new Error('Achievement not found');
    }
});

// @desc    Create new achievement
// @route   POST /api/achievements
// @access  Private/Admin
export const createAchievement = asyncHandler(async (req, res) => {
    const { title, description, type, subcategory, year, socialLinks } = req.body;

    const achievementData = {
        title,
        description,
        type,
        year: parseInt(year, 10),
    };

    if (subcategory) {
        achievementData.subcategory = subcategory.toLowerCase().trim();
    }

    if (socialLinks) {
        achievementData.socialLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
    }

    // Handle uploaded files
    if (req.files) {
        if (req.files.cardImage && req.files.cardImage.length > 0) {
            achievementData.cardImage = await fileToBase64(req.files.cardImage[0].path);
        }
        if (req.files.detailImage && req.files.detailImage.length > 0) {
            achievementData.detailImage = await fileToBase64(req.files.detailImage[0].path);
        }
    }

    if (!achievementData.cardImage) {
        res.status(400);
        throw new Error('Card image is required');
    }

    try {
        const achievement = new Achievement(achievementData);
        const createdAchievement = await achievement.save();
        res.status(201).json(createdAchievement);
    } catch (error) {
        console.error("Achievement Creation Error:", error);
        res.status(400);
        throw new Error(error.message || 'Error creating achievement');
    }
});

// @desc    Update achievement
// @route   PUT /api/achievements/:id
// @access  Private/Admin
export const updateAchievement = asyncHandler(async (req, res) => {
    const { title, description, type, subcategory, year, socialLinks } = req.body;

    const achievement = await Achievement.findById(req.params.id);

    if (achievement) {
        achievement.title = title || achievement.title;
        achievement.description = description || achievement.description;
        achievement.type = type || achievement.type;
        achievement.year = year ? parseInt(year, 10) : achievement.year;
        
        if (subcategory) {
            achievement.subcategory = subcategory.toLowerCase().trim();
        }

        if (socialLinks) {
            achievement.socialLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
        }

        if (req.files) {
            if (req.files.cardImage && req.files.cardImage.length > 0) {
                achievement.cardImage = await fileToBase64(req.files.cardImage[0].path);
            }

            if (req.files.detailImage && req.files.detailImage.length > 0) {
                achievement.detailImage = await fileToBase64(req.files.detailImage[0].path);
            }
        }

        try {
            const updatedAchievement = await achievement.save();
            res.json(updatedAchievement);
        } catch (error) {
            console.error("Achievement Update Error:", error);
            res.status(400);
            throw new Error(error.message || 'Error updating achievement');
        }
    } else {
        res.status(404);
        throw new Error('Achievement not found');
    }
});

// @desc    Delete achievement
// @route   DELETE /api/achievements/:id
// @access  Private/Admin
export const deleteAchievement = asyncHandler(async (req, res) => {
    const achievement = await Achievement.findById(req.params.id);

    if (achievement) {
        await achievement.deleteOne();
        res.json({ message: 'Achievement removed' });
    } else {
        res.status(404);
        throw new Error('Achievement not found');
    }
});
