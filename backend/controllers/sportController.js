import SportEvent from '../models/SportEvent.js';
import SportType from '../models/SportType.js';
import SportAchievement from '../models/SportAchievement.js';
import Event from '../models/Event.js';
import { fileToBase64, filesToBase64 } from '../utils/fileUtils.js';

import asyncHandler from 'express-async-handler';

// Helper to calculate status on the fly
const getStatus = (date) => {
    if (!date) return 'tba';
    const eventDate = new Date(date);
    const now = new Date();
    return eventDate > now ? 'upcoming' : 'past';
};

// @desc    Get all sport events (with pagination/filters)
// @route   GET /api/sports/events
export const getSportEvents = asyncHandler(async (req, res) => {
    const { sportType, search, page = 1, limit = 10, status } = req.query;
    let query = {};

    if (sportType && sportType !== 'ALL') {
        query.sportType = { $regex: `^${sportType}$`, $options: 'i' };
    }
    if (search) {
        query.eventTitle = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const total = await SportEvent.countDocuments(query);
    const events = await SportEvent.find(query)
        .select('-images') // Exclude heavy gallery images from list
        .sort({ eventDate: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

    // Attach dynamic status
    const eventsWithStatus = events.map(ev => ({
        ...ev,
        status: getStatus(ev.eventDate)
    }));

    // Filter by status if requested
    const filteredEvents = status 
        ? eventsWithStatus.filter(ev => ev.status === status.toLowerCase())
        : eventsWithStatus;

    res.json({
        events: filteredEvents,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
    });
});

// @desc    Get single sport event
// @route   GET /api/sports/events/:id
export const getSportEventById = asyncHandler(async (req, res) => {
    const event = await SportEvent.findById(req.params.id).lean();
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    res.json({
        ...event,
        status: getStatus(event.eventDate)
    });
});

// @desc    Create sport event
// @route   POST /api/sports/events
export const createSportEvent = async (req, res) => {
    try {
        const eventData = { ...req.body };

        // Handle images
        if (req.files) {
            if (req.files.eventImage) {
                eventData.eventImage = await fileToBase64(req.files.eventImage[0].path);
            }
            if (req.files.images) {
                eventData.images = await filesToBase64(req.files.images);
            }
        }

        // Parse JSON strings from FormData
        if (typeof eventData.matches === 'string') eventData.matches = JSON.parse(eventData.matches);
        if (typeof eventData.teams === 'string') eventData.teams = JSON.parse(eventData.teams);
        if (typeof eventData.socialLinks === 'string') eventData.socialLinks = JSON.parse(eventData.socialLinks);

        // NORMALIZATION: Enforce lowercase for matching
        if (eventData.sportType) eventData.sportType = eventData.sportType.toLowerCase();

        // CLEANUP: Filter out empty sub-items
        if (eventData.matches) {
            // Filter out if both teams and date are empty
            eventData.matches = eventData.matches.filter(m => m.teamA || m.teamB || m.matchDate);
            // Fix empty date strings causing CastError
            eventData.matches = eventData.matches.map(m => {
                const cleaned = { ...m };
                if (cleaned.matchDate === '') delete cleaned.matchDate;
                return cleaned;
            });
        }
        if (eventData.teams) {
            eventData.teams = eventData.teams.filter(t => t.name || t.description);
        }

        const sportEvent = new SportEvent(eventData);
        await sportEvent.save();

        // SYNC TO GENERAL EVENTS (CRITICAL: Use referenceId)
        await Event.create({
            eventType: 'sports',
            subcategory: sportEvent.sportType, // Already lowercased
            eventTitle: sportEvent.eventTitle,
            eventDate: sportEvent.eventDate,
            image: sportEvent.eventImage,
            description: sportEvent.description,
            referenceId: sportEvent._id,
            status: getStatus(sportEvent.eventDate)
        });

        res.status(201).json(sportEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update sport event
// @route   PUT /api/sports/events/:id
export const updateSportEvent = async (req, res) => {
    try {
        const event = await SportEvent.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const updateData = { ...req.body };

        // Handle images
        if (req.files) {
            if (req.files.eventImage) {
                updateData.eventImage = await fileToBase64(req.files.eventImage[0].path);
            }
            if (req.files.images) {
                updateData.images = await filesToBase64(req.files.images);
            }
        }

        // Parse JSON strings
        if (typeof updateData.matches === 'string') updateData.matches = JSON.parse(updateData.matches);
        if (typeof updateData.teams === 'string') updateData.teams = JSON.parse(updateData.teams);
        if (typeof updateData.socialLinks === 'string') updateData.socialLinks = JSON.parse(updateData.socialLinks);

        // NORMALIZATION: Enforce lowercase
        if (updateData.sportType) updateData.sportType = updateData.sportType.toLowerCase();

        // CLEANUP: Filter out empty sub-items
        if (updateData.matches) {
            updateData.matches = updateData.matches.filter(m => m.teamA || m.teamB || m.matchDate);
            updateData.matches = updateData.matches.map(m => {
                const cleaned = { ...m };
                if (cleaned.matchDate === '') delete cleaned.matchDate;
                return cleaned;
            });
        }
        if (updateData.teams) {
            updateData.teams = updateData.teams.filter(t => t.name || t.description);
        }

        const updatedEvent = await SportEvent.findByIdAndUpdate(req.params.id, updateData, { new: true });
        
        // Update general event sync (CRITICAL: Match by referenceId)
        await Event.findOneAndUpdate(
            { referenceId: req.params.id },
            {
                eventType: 'sports',
                subcategory: updatedEvent.sportType, // Already lowercased
                eventTitle: updatedEvent.eventTitle,
                eventDate: updatedEvent.eventDate,
                image: updatedEvent.eventImage,
                description: updatedEvent.description,
                status: getStatus(updatedEvent.eventDate)
            },
            { upsert: true }
        );

        res.json(updatedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete sport event
// @route   DELETE /api/sports/events/:id
export const deleteSportEvent = async (req, res) => {
    try {
        const event = await SportEvent.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Delete from general events too
        await Event.findOneAndDelete({ referenceId: req.params.id });

        res.json({ message: 'Event removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// CATEGORY MANAGEMENT
export const getSportTypes = asyncHandler(async (req, res) => {
    const types = await SportType.find().sort({ name: 1 }).lean();
    res.json(types);
});

export const createSportType = async (req, res) => {
    try {
        const typeData = { ...req.body };
        if (req.file) {
            typeData.image = await fileToBase64(req.file.path);
        }
        const type = await SportType.create(typeData);
        res.status(201).json(type);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateSportType = async (req, res) => {
    try {
        const typeData = { ...req.body };
        if (req.file) {
            typeData.image = await fileToBase64(req.file.path);
        }
        const type = await SportType.findByIdAndUpdate(req.params.id, typeData, { new: true });
        if (!type) return res.status(404).json({ message: 'Sport type not found' });
        res.json(type);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteSportType = async (req, res) => {
    try {
        const type = await SportType.findByIdAndDelete(req.params.id);
        if (!type) return res.status(404).json({ message: 'Sport type not found' });
        res.json({ message: 'Sport type removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ACHIEVEMENTS
export const getSportAchievements = async (req, res) => {
    try {
        const { sportType } = req.query;
        let query = {};
        if (sportType) query.sportType = { $regex: `^${sportType}$`, $options: 'i' };
        
        const achievements = await SportAchievement.find(query).sort({ year: -1 });
        res.json(achievements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createSportAchievement = async (req, res) => {
    try {
        const achievement = await SportAchievement.create(req.body);
        res.status(201).json(achievement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteSportAchievement = async (req, res) => {
    try {
        const achievement = await SportAchievement.findByIdAndDelete(req.params.id);
        if (!achievement) return res.status(404).json({ message: 'Achievement not found' });
        res.json({ message: 'Achievement removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
