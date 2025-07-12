const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const CustomError = require('../utils/errorHandler'); // Assuming CustomError for consistency

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new CustomError('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return next(new CustomError('The user belonging to this token no longer exists.', 401));
    }
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new CustomError('Invalid token, please log in again!', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new CustomError('Your token has expired! Please log in again.', 401));
    }
    next(error); // Pass other errors to the global error handler
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new CustomError(`User role ${req.user.role} is not authorized to access this route`, 403));
    }
    next();
  };
};