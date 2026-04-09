import express from 'express';
import { check } from 'express-validator';
const router = express.Router();
import {
  registerUser,
  loginUser,
  adminLogin,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';

router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('phoneNumber', 'Please enter a valid phone number (10 digits)').isLength({
      min: 10,
      max: 10,
    }),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
  ],
  registerUser
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  loginUser
);

router.post(
  '/admin-login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  adminLogin
);

router.post('/verify', verifyEmail);

router.post(
  '/forgot-password',
  [check('email', 'Please include a valid email').isEmail()],
  forgotPassword
);

router.post(
  '/reset-password/:token',
  [
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('otp', 'OTP is required').exists(),
  ],
  resetPassword
);

export default router;
