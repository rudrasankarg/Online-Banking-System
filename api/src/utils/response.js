// src/utils/response.js
module.exports = {
  success: (res, data, message = 'Success') => {
    res.status(200).json({ status: 'success', message, data });
  },
  created: (res, data, message = 'Created') => {
    res.status(201).json({ status: 'success', message, data });
  },
  error: (res, error, statusCode = 500) => {
    res.status(statusCode).json({ status: 'error', message: error.message || 'Error', error });
  },
};
