const express = require('express');
const router = express.Router();
const { success } = require('../utils/response');
const { verifyToken, authorize } = require('../middleware/auth');
const { ApiError } = require('../utils/error');
const Card = require('../models/card');
const Account = require('../models/account');
const authService = require('../services/authService');
const User = require('../models/user');

router.get('/', verifyToken, authorize('user', 'admin'), async (req, res, next) => {
  try {
    const cards = await Card.findByUserId(req.user.id);
    success(res, cards, 'Fetched user cards');
  } catch (err) {
    next(err);
  }
});

router.post('/apply', verifyToken, authorize('user', 'admin'), async (req, res, next) => {
  try {
    const user = await User.findUserById(req.user.id);
    await authService.ensureUserAssets(user);
    const account = await Account.findPrimaryByUserId(req.user.id);
    if (!account) throw new ApiError('Account not found', 404);

    const card = await Card.create({
      accountId: account.id,
      userId: req.user.id,
      cardNumber: authService.generateCardNumber(),
      cardType: req.body.cardType || 'Visa Signature',
      expiryDate: authService.generateExpiryDate(),
      cvv: authService.generateCvv(),
      creditLimit: 50000
    });

    success(res, card, 'Card application submitted successfully');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
