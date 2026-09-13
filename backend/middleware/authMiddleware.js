const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/responseHandler');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Access denied. Please log in to continue.', 401, 'AUTH_TOKEN_MISSING');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_nutripulse_2026');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return errorResponse(res, 'The user belonging to this token no longer exists.', 401, 'USER_NOT_FOUND');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Your session has expired. Please log in again.', 401, 'AUTH_TOKEN_EXPIRED');
    }
    return errorResponse(res, 'Invalid authentication token.', 401, 'AUTH_TOKEN_INVALID');
  }
};

module.exports = { protect };
