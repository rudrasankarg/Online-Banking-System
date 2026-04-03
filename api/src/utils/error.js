// src/utils/error.js
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

const errorHandler = (err, req, res, next) => {
  console.error('[Global Error]', err);
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ status: 'error', message });
};

module.exports = { ApiError, errorHandler };
