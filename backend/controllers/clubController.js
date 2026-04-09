import ClubEvent from '../models/ClubEvent.js';
import ClubType from '../models/ClubType.js';
import Event from '../models/Event.js';
import asyncHandler from 'express-async-handler';
import { fileToBase64, filesToBase64 } from '../utils/fileUtils.js';

// Helper to calculate status on the fly
const getStatus = (date) => {
    if (!date) return 'tba';
    const eventDate = new Date(date);
    const now = new Date();
    return eventDate > now ? 'upcoming' : 'past';
};

// @desc    Get all club events (with pagination/filters)
// @route   GET /api/clubs/events
export const getClubEvents = asyncHandler(async (req, res) => {
    const { clubName, search, page = 1, limit = 10, status } = req.query;
    let query = {};

    if (clubName && clubName !== 'ALL') {
        // Use case-insensitive regex for robust matching
        query.clubName = { $regex: `^${clubName}$`, $options: 'i' };
    }
    if (search) {
        query.eventTitle = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const total = await ClubEvent.countDocuments(query);
    const events = await ClubEvent.find(query)
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

// @desc    Get single club event
// @route   GET /api/clubs/events/:id
export const getClubEventById = asyncHandler(async (req, res) => {
    const event = await ClubEvent.findById(req.params.id).lean();
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    res.json({
        ...event,
        status: getStatus(event.eventDate)
    });
});

// @desc    Create club event
// @route   POST /api/clubs/events
export const createClubEvent = async (req, res) => {
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
        if (typeof eventData.activities === 'string') eventData.activities = JSON.parse(eventData.activities);
        if (typeof eventData.achievements === 'string') eventData.achievements = JSON.parse(eventData.achievements);
        if (typeof eventData.socialLinks === 'string') eventData.socialLinks = JSON.parse(eventData.socialLinks);

        // NORMALIZATION: Enforce lowercase for matching
        if (eventData.clubName) eventData.clubName = eventData.clubName.toLowerCase();

        // CLEANUP: Filter out empty sub-items
        if (eventData.activities) {
            eventData.activities = eventData.activities.filter(a => a.name || a.description || a.time);
        }
        if (eventData.achievements) {
            eventData.achievements = eventData.achievements.filter(a => a.title || a.description || a.recipient);
        }

        const clubEvent = await ClubEvent.create(eventData);

        // SYNC TO GENERAL EVENTS (CRITICAL: Use referenceId and normalized subcategory)
        await Event.create({
            eventType: 'clubs',
            subcategory: clubEvent.clubName, // Already lowercased
            eventTitle: clubEvent.eventTitle,
            eventDate: clubEvent.eventDate,
            image: clubEvent.eventImage,
            description: clubEvent.description,
            referenceId: clubEvent._id,
            status: getStatus(clubEvent.eventDate)
        });

        res.status(201).json(clubEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update club event
// @route   PUT /api/clubs/events/:id
export const updateClubEvent = async (req, res) => {
    try {
        const event = await ClubEvent.findById(req.params.id);
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
        if (typeof updateData.activities === 'string') updateData.activities = JSON.parse(updateData.activities);
        if (typeof updateData.achievements === 'string') updateData.achievements = JSON.parse(updateData.achievements);
        if (typeof updateData.socialLinks === 'string') updateData.socialLinks = JSON.parse(updateData.socialLinks);

        // NORMALIZATION: Enforce lowercase
        if (updateData.clubName) updateData.clubName = updateData.clubName.toLowerCase();

        // CLEANUP: Filter out empty sub-items
        if (updateData.activities) {
            updateData.activities = updateData.activities.filter(a => a.name || a.description || a.time);
        }
        if (updateData.achievements) {
            updateData.achievements = updateData.achievements.filter(a => a.title || a.description || a.recipient);
        }

        const updatedEvent = await ClubEvent.findByIdAndUpdate(req.params.id, updateData, { new: true });
        
        // Update general event sync (CRITICAL: Match by referenceId)
        await Event.findOneAndUpdate(
            { referenceId: req.params.id },
            {
                eventType: 'clubs',
                subcategory: updatedEvent.clubName, // Already lowercased
                eventTitle: updatedEvent.eventTitle,
                eventDate: updatedEvent.eventDate,
                image: updatedEvent.eventImage,
                description: updatedEvent.description,
                status: getStatus(updatedEvent.eventDate)
            },
            { upsert: true } // Create if missing (for legacy events)
        );

        res.json(updatedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete club event
// @route   DELETE /api/clubs/events/:id
export const deleteClubEvent = async (req, res) => {
    try {
        const event = await ClubEvent.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Delete from general events too
        await Event.findOneAndDelete({ referenceId: req.params.id });

        res.json({ message: 'Event removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// CATEGORY (CLUB TYPE) MANAGEMENT
export const getClubTypes = async (req, res) => {
    try {
        const types = await ClubType.find().sort({ name: 1 });
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createClubType = async (req, res) => {
    try {
        const typeData = { ...req.body };
        if (req.file) {
            typeData.image = await fileToBase64(req.file.path);
        }
        const type = await ClubType.create(typeData);
        res.status(201).json(type);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateClubType = async (req, res) => {
    try {
        const typeData = { ...req.body };
        if (req.file) {
            typeData.image = await fileToBase64(req.file.path);
        }
        const type = await ClubType.findByIdAndUpdate(req.params.id, typeData, { new: true });
        if (!type) return res.status(404).json({ message: 'Club type not found' });
        res.json(type);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteClubType = async (req, res) => {
    try {
        const type = await ClubType.findByIdAndDelete(req.params.id);
        if (!type) return res.status(404).json({ message: 'Club type not found' });
        res.json({ message: 'Club type removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
