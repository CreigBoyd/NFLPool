/**
 * Custom error class for operational errors
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errorCode = err.errorCode || 'INTERNAL_ERROR';
  
  // Log errors
  if (!err.isOperational) {
    console.error('UNEXPECTED ERROR:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      body: req.body
    });
  } else {
    console.log('Operational error:', {
      message: err.message,
      errorCode: err.errorCode,
      url: req.url
    });
  }
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
  }
  
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Resource already exists';
    errorCode = 'DUPLICATE_ENTRY';
  }
  
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    errorCode = 'INVALID_TOKEN';
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    errorCode = 'TOKEN_EXPIRED';
  }
  
  // Send error response
  const response = {
    error: message,
    errorCode: errorCode
  };
  
  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.details = err;
  }
  
  res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Route not found: ${req.method} ${req.url}`,
    404,
    'NOT_FOUND'
  );
  next(error);
};

/**
 * Validation error creator
 */
export const validationError = (message) => {
  return new AppError(message, 400, 'VALIDATION_ERROR');
};

/**
 * Authentication error creator
 */
export const authError = (message = 'Authentication required') => {
  return new AppError(message, 401, 'AUTH_ERROR');
};

/**
 * Authorization error creator
 */
export const forbiddenError = (message = 'Access forbidden') => {
  return new AppError(message, 403, 'FORBIDDEN');
};

/**
 * Database error handler
 */
export const handleDatabaseError = (error, context = '') => {
  console.error(`Database error (${context}):`, {
    code: error.code,
    message: error.message,
    sql: error.sql
  });
  
  if (error.code === 'ER_DUP_ENTRY') {
    throw new AppError('Duplicate entry', 409, 'DUPLICATE_ENTRY');
  }
  
  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    throw new AppError('Referenced resource not found', 404, 'REFERENCE_NOT_FOUND');
  }
  
  if (error.code === 'ECONNREFUSED') {
    throw new AppError('Database connection failed', 503, 'DB_CONNECTION_ERROR');
  }
  
  throw new AppError('Database operation failed', 500, 'DB_ERROR');
};

export default {
  AppError,
  errorHandler,
  asyncHandler,
  notFoundHandler,
  validationError,
  authError,
  forbiddenError,
  handleDatabaseError
};