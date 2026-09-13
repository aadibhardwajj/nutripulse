const { errorResponse } = require('../utils/responseHandler');

const notFound = (req, res, next) => {
  return errorResponse(res, `Resource not found at ${req.originalUrl}`, 404, 'NOT_FOUND');
};

const errorHandler = (err, req, res, next) => {
  console.error('Error encountered:', err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  let code = 'INTERNAL_SERVER_ERROR';

  // Handle Mongoose duplicate key error (11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `An entry with this ${field} already exists.`;
    code = 'DUPLICATE_KEY_ERROR';
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join(', ');
    code = 'VALIDATION_ERROR';
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format for field ${err.path}`;
    code = 'INVALID_ID';
  }

  // Handle JWT error
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token signature';
    code = 'AUTH_TOKEN_INVALID';
  }

  return errorResponse(res, message, statusCode, code);
};

module.exports = { notFound, errorHandler };
