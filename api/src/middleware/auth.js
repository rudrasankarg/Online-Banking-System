// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/error');

// Verify JWT and attach user info to request
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError('Authorization token missing', 401));
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // payload should contain id and role
    next();
  } catch (err) {
    return next(new ApiError('Invalid token', 403));
  }
};

// Role based access control
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError('User not authenticated', 401));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError('Forbidden: insufficient privileges', 403));
    }
    next();
  };
};

module.exports = { verifyToken, authorize };
