import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

const studentOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'student' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized, student or admin only' });
  }
};

const populateUser = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('--- PopulateUser Debug ---');
      console.log('Token found:', token.substring(0, 10) + '...');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded ID:', decoded.id);
      
      req.user = await User.findById(decoded.id).select('-password');
      if (req.user) {
        console.log('User found:', req.user.name, 'Role:', req.user.role);
      } else {
        console.log('User not found in DB for ID:', decoded.id);
      }
    } catch (error) {
      console.error('Token verification in populateUser failed:', error.message);
    }
  } else {
    console.log('--- PopulateUser Debug ---');
    console.log('No Bearer token found in headers');
  }
  next();
};

export { protect, admin, studentOrAdmin, populateUser };
