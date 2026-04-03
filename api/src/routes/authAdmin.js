const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { ApiError } = require('../utils/error');

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError('Email and password required', 400);

    const result = await authService.initLogin(email, password, 'admin');
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login/verify', async (req, res, next) => {
  try {
    const { tempToken, otp } = req.body;
    if (!tempToken || !otp) throw new ApiError('Missing token or OTP', 400);

    const result = await authService.verifyLogin(tempToken, otp);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
