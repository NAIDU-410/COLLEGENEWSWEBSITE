import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all admins
// @route   GET /api/admins
// @access  Private/Admin
const getAdmins = asyncHandler(async (req, res) => {
  const admins = await User.find({ role: 'admin' }).select('-password');
  res.json(admins);
});

// @desc    Create new admin
// @route   POST /api/admins
// @access  Private/Admin
const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, phoneNumber } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    phoneNumber,
    role: 'admin',
    isVerified: true, // Mark as verified as it's created by an admin
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Update admin
// @route   PUT /api/admins/:id
// @access  Private/Admin
const updateAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete admin
// @route   DELETE /api/admins/:id
// @access  Private/Admin
const deleteAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot delete yourself');
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export { getAdmins, createAdmin, updateAdmin, deleteAdmin };
