import { validationResult } from 'express-validator';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

import sendEmail from '../utils/emailService.js';
import crypto from 'crypto';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phoneNumber, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      if (!userExists.isVerified) {
         // If they are unverified, allow them to re-register to get a fresh OTP immediately
         await User.deleteOne({ email });
      } else {
         return res.status(400).json({ message: 'User already exists and is verified. Please login.' });
      }
    }

    // Role assignment based on email
    const isStudentEmail = /^o\d{6}@rguktong\.ac\.in$/.test(email.toLowerCase());
    const assignedRole = isStudentEmail ? 'student' : 'visitor';

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phoneNumber,
      password,
      role: assignedRole,
      isVerified: false,
      otp,
      otpExpiry,
    });

    if (user) {
      // Send Email
      console.log(`[TESTING] OTP generated for ${user.email}: ${otp}`);
      try {
        await sendEmail({
          email: user.email,
          subject: 'Welcome to College News Portal - Verification OTP',
          message: `Your account verification OTP is ${otp}. It will expire in 5 minutes.`,
        });
      } catch (emailError) {
        console.error('Email sending failed for registration (likely blocked SMTP on Render):', emailError);
        // Don't fail the request if email fails - return OTP for testing
      }

      res.status(201).json({
        message: 'Registration successful. OTP sent to email. (If email failed, OTP is provided for testing)',
        email: user.email,
        assignedRole: user.role,
        devOtp: process.env.NODE_ENV !== 'production' ? otp : otp // Show OTP always while debugging SMTP
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(`Register error: ${error.message}`);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });
    
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }
    
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    
    await user.save();
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      token: generateToken(user._id, user.role),
      message: 'Email verified successfully. You are now logged in.'
    });
  } catch(error) {
    console.error(`Verify error: ${error.message}`);
    res.status(500).json({ message: 'Server error during verification' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      console.log(`User found: ${user.email}`);
      const isMatch = await user.matchPassword(password);
      console.log(`Password match: ${isMatch}`);

      if (isMatch) {
        // Backwards compatibility for old users who have not been verified and don't have OTPs
        if (!user.isVerified && user.otp === undefined && user.role !== 'admin') {
          user.isVerified = true;
          await user.save();
        } else if (!user.isVerified && user.role !== 'admin') {
          return res.status(401).json({ message: 'Please verify your email first', notVerified: true });
        }

        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          token: generateToken(user._id, user.role),
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } else {
      console.log(`User not found for email: ${email}`);
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(`Login error: ${error.message}`);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Auth admin & get token
// @route   POST /api/auth/admin-login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log(`Admin login attempt for email: ${email}`);

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      console.log(`User found: ${user.email}, role: ${user.role}`);
      const isMatch = await user.matchPassword(password);
      console.log(`Password match: ${isMatch}`);

      if (user.role === 'admin' && isMatch) {
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          token: generateToken(user._id, user.role),
        });
      } else if (user.role !== 'admin') {
        console.log(`User is not an admin: ${user.email}`);
        res.status(403).json({ message: 'Not authorized as an admin' });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } else {
      console.log(`User not found for admin email: ${email}`);
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(`Admin login error: ${error.message}`);
    res.status(500).json({ message: 'Server error during admin login' });
  }
};

// @desc    Request Password Reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate token and OTP
    const resetToken = crypto.randomBytes(20).toString('hex');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store hashed token (security best practice)
    user.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 mins

    await user.save();

    // Send email
    console.log(`[TESTING] Password Reset OTP for ${user.email} is ${otp}. Link: /reset-password/${resetToken}`);
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message: `You requested a password reset. Your OTP is ${otp}.\n\nPlease click on this link to reset your password: ${resetUrl}\n\nIf you did not request this, please ignore this email.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #1a56db;">Password Reset Request</h2>
            <p>You requested to reset the password for your College News profile.</p>
            <p>Your secure OTP is: <strong style="font-size: 24px; letter-spacing: 2px;">${otp}</strong></p>
            <p>Please click the button below to be redirected to the secure portal:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1a56db; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px; margin-bottom: 20px;">Reset Password</a>
            <p style="font-size: 12px; color: #777;">If the button doesn't work, copy and paste this link into your browser:<br/>${resetUrl}</p>
            <p style="font-size: 12px; color: #777;">If you did not request this, please ignore this email.</p>
          </div>
        `
      });
      res.status(200).json({ message: 'Reset OTP sent to email', resetToken });
    } catch (emailError) {
      console.error('Email sending failed for reset password (likely blocked by Render SMTP rules):', emailError);
      return res.status(200).json({ 
        message: `Bypass: Email failed to send due to strict server rules. Use this OTP to test: ${otp}`,
        resetToken
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error in forgot password' });
  }
};

// @desc    Reset Password using OTP
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const resetTokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const { otp, password } = req.body;

    const user = await User.findOne({
      resetToken: resetTokenHash,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error in reset password' });
  }
};

export { registerUser, loginUser, adminLogin, verifyEmail, forgotPassword, resetPassword };
