import Event from '../models/Event.js';
import SportEvent from '../models/SportEvent.js';
import ClubEvent from '../models/ClubEvent.js';
import asyncHandler from 'express-async-handler';
import { fileToBase64, filesToBase64 } from '../utils/fileUtils.js';

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = asyncHandler(async (req, res) => {
  const eventData = { ...req.body };

  // Handle normalization
  if (eventData.subcategory) {
    eventData.subcategory = eventData.subcategory.toLowerCase().trim();
  }

  // Handle dates
  if (eventData.eventDate) {
    eventData.eventDate = new Date(eventData.eventDate);
  }

  // Handle specialized fields (parsing JSON strings from FormData)
  const jsonFields = ['matches', 'teams', 'activities', 'achievements', 'socialLinks', 'images'];
  jsonFields.forEach(field => {
    if (typeof eventData[field] === 'string') {
      try {
        eventData[field] = JSON.parse(eventData[field]);
      } catch (e) {
        // Fallback or leave as is if already a string (like a single image URL in socialLinks?)
      }
    }
  });

  // Handle file uploads (compatible with both upload.single and upload.fields)
  if (req.file) {
    eventData.image = await fileToBase64(req.file.path);
  } else if (req.files) {
    if (req.files.image) {
      eventData.image = await fileToBase64(req.files.image[0].path);
    }
    if (req.files.eventImage) {
      eventData.image = await fileToBase64(req.files.eventImage[0].path);
    }
    if (req.files.images) {
      const newImages = await filesToBase64(req.files.images);
      eventData.images = [...(eventData.images || []), ...newImages];
    }
  }

  const event = new Event(eventData);
  const createdEvent = await event.save();
  res.status(201).json(createdEvent);
});

// @desc    Get all events with optional filtering
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  const { type, subcategory, search, page = 1, limit = 10 } = req.query;
  const filter = {};

  if (type && type !== 'ALL') filter.eventType = type;
  if (subcategory && subcategory !== 'ALL') {
    filter.subcategory = subcategory.toLowerCase().trim();
  }
  if (search) {
    filter.eventTitle = { $regex: search, $options: 'i' };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Event.countDocuments(filter);
  
  const events = await Event.find(filter)
    .select('-images') // Exclude gallery from list
    .sort({ eventDate: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    events,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    total
  });
});

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  const updateData = { ...req.body };

  // Handle normalization
  if (updateData.subcategory) {
    updateData.subcategory = updateData.subcategory.toLowerCase().trim();
  }

  // Handle dates
  if (updateData.eventDate) {
    updateData.eventDate = new Date(updateData.eventDate);
  }

  // Handle specialized fields (parsing JSON strings)
  const jsonFields = ['matches', 'teams', 'activities', 'achievements', 'socialLinks', 'images'];
  jsonFields.forEach(field => {
    if (typeof updateData[field] === 'string') {
      try {
        updateData[field] = JSON.parse(updateData[field]);
      } catch (e) {}
    }
  });

  // Handle file uploads (compatible with both upload.single and upload.fields)
  if (req.file) {
    updateData.image = await fileToBase64(req.file.path);
  } else if (req.files) {
    if (req.files.image) {
      updateData.image = await fileToBase64(req.files.image[0].path);
    }
    if (req.files.eventImage) {
      updateData.image = await fileToBase64(req.files.eventImage[0].path);
    } else if (updateData.existingEventImage === '') {
      // Explicit removal of banner
      updateData.image = '';
    }

    // Handle Gallery Images (Merging existing + new)
    let finalImages = [];
    if (typeof updateData.existingImages === 'string') {
      try {
        finalImages = JSON.parse(updateData.existingImages);
      } catch (e) {
        finalImages = [];
      }
    } else if (Array.isArray(updateData.existingImages)) {
      finalImages = updateData.existingImages;
    }

    if (req.files.images) {
      const newImages = await filesToBase64(req.files.images);
      finalImages = [...finalImages, ...newImages];
    }
    updateData.images = finalImages;
  } else if (updateData.existingEventImage === '') {
    // Case where no files but banner was cleared
    updateData.image = '';
  }

  Object.assign(event, updateData);
  const updatedEvent = await event.save();
  res.json(updatedEvent);
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (event) {
    await event.deleteOne();
    res.json({ message: 'Event removed' });
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Public
const getUpcomingEvents = asyncHandler(async (req, res) => {
  const currentDate = new Date();
  const events = await Event.find({
    eventDate: { $gte: currentDate }
  })
  .select('_id eventTitle eventDate eventType subcategory')
  .sort({ eventDate: 1 });

  res.json(events);
});

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (event) {
    res.json(event);
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

export {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getUpcomingEvents
};
