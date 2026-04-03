const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { ApiError } = require('../utils/error');

// Init Register -> Setup memory cache and send OTP via Nodemailer/Twilio
router.post('/register', async (req, res, next) => {
  try {
    const result = await authService.initRegister(req.body);
    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// Verify Register -> Check OTP and actually commit User to DB
router.post('/register/verify', async (req, res, next) => {
  try {
    const { tempToken, otp } = req.body;
    if (!tempToken || !otp) throw new ApiError('Missing token or OTP', 400);

    const result = await authService.verifyRegister(tempToken, otp);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// Init Login -> Check password and send OTP
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError('Email and password required', 400);

    const result = await authService.initLogin(email, password, 'user');
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// Verify Login -> Check OTP and return token
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

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new ApiError('Email is required', 400);

    const result = await authService.requestPasswordReset(email);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) throw new ApiError('Reset token and password are required', 400);

    const result = await authService.resetPassword(token, password);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
