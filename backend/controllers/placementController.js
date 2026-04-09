import Placement from '../models/Placement.js';
import asyncHandler from 'express-async-handler';
import { fileToBase64 } from '../utils/fileUtils.js';

// @desc    Create a new placement/internship
// @route   POST /api/placements
// @access  Private/Admin
const createPlacement = asyncHandler(async (req, res) => {
  const {
    type,
    companyName,
    role,
    location,
    duration,
    stipendOrSalary,
    description,
    skills,
    deadline,
    experience,
    cgpa,
    mode,
    companyUrl,
    applyLink,
    socialLinks,
    eligibleBatches,
    eligibleBranches,
    processDescription
  } = req.body;

  // socialLinks and skills might be sent as strings if from FormData
  const parsedSocialLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
  const parsedSkills = typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(s => s !== '') : skills;
  const parsedBatches = typeof eligibleBatches === 'string' ? eligibleBatches.split(',').map(s => s.trim()).filter(s => s !== '') : eligibleBatches;
  const parsedBranches = typeof eligibleBranches === 'string' ? eligibleBranches.split(',').map(s => s.trim()).filter(s => s !== '') : eligibleBranches;

  const placement = new Placement({
    type,
    companyName,
    role,
    location,
    duration,
    stipendOrSalary,
    description,
    skills: parsedSkills,
    deadline,
    experience,
    cgpa,
    mode,
    companyUrl,
    applyLink,
    socialLinks: parsedSocialLinks,
    eligibleBatches: parsedBatches,
    eligibleBranches: parsedBranches,
    processDescription,
    logo: req.file ? await fileToBase64(req.file.path) : null
  });

  const createdPlacement = await placement.save();
  res.status(201).json(createdPlacement);
});

// @desc    Get all placements with optional filtering
// @route   GET /api/placements
// @access  Public
const getPlacements = asyncHandler(async (req, res) => {
  const { type, search } = req.query;
  const filter = {};

  if (type) {
    // Standardize type (internship -> Internship, placement -> Placement)
    if (type.toLowerCase() === 'internship') filter.type = 'Internship';
    if (type.toLowerCase() === 'placement') filter.type = 'Placement';
  }

  if (search) {
    filter.$or = [
      { companyName: { $regex: search, $options: 'i' } },
      { role: { $regex: search, $options: 'i' } },
      { skills: { $regex: search, $options: 'i' } }
    ];
  }

  const placements = await Placement.find(filter).sort({ createdAt: -1 });
  res.json(placements);
});

// @desc    Get a single placement
// @route   GET /api/placements/:id
// @access  Public
const getSinglePlacement = asyncHandler(async (req, res) => {
  const placement = await Placement.findById(req.params.id);

  if (placement) {
    res.json(placement);
  } else {
    res.status(404);
    throw new Error('Placement not found');
  }
});

// @desc    Update a placement
// @route   PUT /api/placements/:id
// @access  Private/Admin
const updatePlacement = asyncHandler(async (req, res) => {
  const placement = await Placement.findById(req.params.id);

  if (placement) {
    const {
      type,
      companyName,
      role,
      location,
      duration,
      stipendOrSalary,
      description,
      skills,
      deadline,
      experience,
      cgpa,
      mode,
      companyUrl,
      applyLink,
      socialLinks,
      eligibleBatches,
      eligibleBranches,
      processDescription
    } = req.body;

    placement.type = type || placement.type;
    placement.companyName = companyName || placement.companyName;
    placement.role = role || placement.role;
    placement.location = location || placement.location;
    placement.duration = duration || placement.duration;
    placement.stipendOrSalary = stipendOrSalary || placement.stipendOrSalary;
    placement.description = description || placement.description;
    placement.deadline = deadline || placement.deadline;
    placement.experience = experience || placement.experience;
    placement.cgpa = cgpa || placement.cgpa;
    placement.mode = mode || placement.mode;
    placement.companyUrl = companyUrl || placement.companyUrl;
    placement.applyLink = applyLink || placement.applyLink;
    placement.processDescription = processDescription || placement.processDescription;

    if (skills) {
      placement.skills = typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : skills;
    }

    if (socialLinks) {
      placement.socialLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
    }

    if (eligibleBatches) {
      placement.eligibleBatches = typeof eligibleBatches === 'string' ? eligibleBatches.split(',').map(s => s.trim()).filter(s => s !== '') : eligibleBatches;
    }

    if (eligibleBranches) {
      placement.eligibleBranches = typeof eligibleBranches === 'string' ? eligibleBranches.split(',').map(s => s.trim()).filter(s => s !== '') : eligibleBranches;
    }

    if (req.file) {
      placement.logo = await fileToBase64(req.file.path);
    }

    const updatedPlacement = await placement.save();
    res.json(updatedPlacement);
  } else {
    res.status(404);
    throw new Error('Placement not found');
  }
});

// @desc    Delete a placement
// @route   DELETE /api/placements/:id
// @access  Private/Admin
const deletePlacement = asyncHandler(async (req, res) => {
  const placement = await Placement.findById(req.params.id);

  if (placement) {
    await placement.deleteOne();
    res.json({ message: 'Placement removed' });
  } else {
    res.status(404);
    throw new Error('Placement not found');
  }
});

export {
  createPlacement,
  getPlacements,
  getSinglePlacement,
  updatePlacement,
  deletePlacement
};
