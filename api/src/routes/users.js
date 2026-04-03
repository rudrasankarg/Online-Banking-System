const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { success } = require('../utils/response');
const { verifyToken, authorize } = require('../middleware/auth');
const { ApiError } = require('../utils/error');
const User = require('../models/user');
const Account = require('../models/account');
const Card = require('../models/card');
const Transaction = require('../models/transaction');
const ServiceRequest = require('../models/serviceRequest');
const otpService = require('../services/otpService');
const authService = require('../services/authService');
const db = require('../db');

const serviceCatalog = [
  { code: 'savings_account', title: 'Savings Account', amount: 0, group: 'products' },
  { code: 'salary_account', title: 'Salary Account', amount: 0, group: 'products' },
  { code: 'current_account', title: 'Current Account', amount: 999, group: 'products' },
  { code: 'premium_credit_card', title: 'Premium Credit Card', amount: 1499, group: 'products' },
  { code: 'travel_credit_card', title: 'Travel Credit Card', amount: 999, group: 'products' },
  { code: 'debit_card', title: 'Debit Card', amount: 299, group: 'products' },
  { code: 'personal_loan', title: 'Personal Loan', amount: 0, group: 'products' },
  { code: 'home_loan', title: 'Home Loan', amount: 0, group: 'products' },
  { code: 'instant_car_loan', title: 'Instant Car Loan', amount: 0, group: 'products' },
  { code: 'open_new_account', title: 'Open New Account', amount: 0, group: 'services' },
  { code: 'account_statement', title: 'Account Statement', amount: 99, group: 'services' },
  { code: 'upgrade_account', title: 'Upgrade Account', amount: 4999, group: 'services' },
  { code: 'utility_bill_payment', title: 'Utility Bill Payment', amount: 0, group: 'services' },
  { code: 'credit_card_bill', title: 'Credit Card Bill', amount: 0, group: 'services' },
  { code: 'tax_payment', title: 'Tax Payment', amount: 0, group: 'services' },
  { code: 'order_cheque_book', title: 'Order Cheque Book', amount: 149, group: 'services' },
  { code: 'stop_payment', title: 'Stop Payment', amount: 79, group: 'services' },
  { code: 'update_kyc', title: 'Update KYC', amount: 0, group: 'services' },
  { code: 'new_checkbook', title: 'Request New Checkbook', amount: 199, group: 'services' }
];

global.transferBuffer = global.transferBuffer || {};
global.cardActionBuffer = global.cardActionBuffer || {};

async function getUserContext(userId) {
  const userResult = await User.findUserById?.(userId);
  const account = await Account.findPrimaryByUserId(userId);
  const cards = await Card.findByUserId(userId);
  return { user: userResult, account, cards };
}

router.get('/profile', verifyToken, authorize('user', 'admin'), async (req, res, next) => {
  try {
    const user = await User.findUserById(req.user.id);
    success(res, user ? { ...user, password_hash: undefined } : null, 'User profile retrieved');
  } catch (err) {
    next(err);
  }
});

router.put('/profile', verifyToken, authorize('user', 'admin'), async (req, res, next) => {
  try {
    const { firstName, lastName, country } = req.body;
    const name = `${(firstName || '').trim()} ${(lastName || '').trim()}`.trim();
    if (!name) throw new ApiError('First name or last name is required', 400);

    const user = await User.updateUserProfile(req.user.id, {
      name,
      country: (country || '').trim() || null
    });

    success(res, { ...user, password_hash: undefined }, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
});

router.patch('/preferences', verifyToken, authorize('user', 'admin'), async (req, res, next) => {
  try {
    const { notificationsEnabled, twoFactorEnabled } = req.body;
    const user = await User.updateUserPreferences(req.user.id, {
      notificationsEnabled: Boolean(notificationsEnabled),
      twoFactorEnabled: Boolean(twoFactorEnabled)
    });

    success(res, { ...user, password_hash: undefined }, 'Preferences updated successfully');
  } catch (err) {
    next(err);
  }
});

router.get('/dashboard', verifyToken, authorize('user', 'admin'), async (req, res, next) => {
  try {
    let user = await User.findUserById(req.user.id);
    const ensured = await authService.ensureUserAssets(user);
    user = ensured.user;
    const account = ensured.account;
    const cards = ensured.cards;
    const services = await ServiceRequest.listByUserId(req.user.id);
    const transactions = account ? await Transaction.getHistoryByAccountId(account.id) : [];

    success(res, {
      user: user ? { ...user, password_hash: undefined } : null,
      account,
      cards,
      services,
      transactions: transactions.slice(0, 8)
    }, 'Dashboard data retrieved');
  } catch (err) {
    next(err);
  }
});

router.get('/transactions', verifyToken, authorize('user', 'admin'), async (req, res, next) => {
  try {
    await authService.ensureUserAssets(await User.findUserById(req.user.id));
    const account = await Account.findPrimaryByUserId(req.user.id);
    if (!account) throw new ApiError('Account not found', 404);

    const transactions = await Transaction.getHistoryByAccountId(account.id, {
      query: req.query.q || '',
      type: req.query.type || ''
    });

    success(res, transactions, 'Transactions retrieved');
  } catch (err) {
    next(err);
  }
});

router.get('/transactions/:transactionId/receipt', verifyToken, authorize('user', 'admin'), async (req, res, next) => {
  try {
    const account = await Account.findPrimaryByUserId(req.user.id);
    if (!account) throw new ApiError('Account not found', 404);

    const tx = await Transaction.findByIdForAccount(req.params.transactionId, account.id);
    if (!tx) throw new ApiError('Transaction not found', 404);

    success(res, tx, 'Receipt data retrieved');
  } catch (err) {
    next(err);
  }
});

router.post('/transfers/init', verifyToken, authorize('user', 'admin'), async (req, res, next) => {
  try {
    const { recipient, accountNum, amount, note, receiptName, receiptData } = req.body;
    const numericAmount = Number(amount);
    if (!recipient || !accountNum || !numericAmount) {
      throw new ApiError('Recipient, account number, and amount are required', 400);
    }

    const user = await User.findUserById(req.user.id);
    await authService.ensureUserAssets(user);
    const account = await Account.findPrimaryByUserId(req.user.id);
    if (!account) throw new ApiError('Account not found', 404);
    if (numericAmount <= 0) throw new ApiError('Amount must be greater than zero', 400);
    if (numericAmount > Number(account.balance)) throw new ApiError('Amount exceeds available balance', 400);

    const otp = otpService.generateOTP();
    await otpService.sendOtpEmail(user.email, otp);

    const tempToken = crypto.randomUUID();
    global.transferBuffer[tempToken] = {
      userId: req.user.id,
      senderId: account.id,
      recipient,
      accountNum,
      amount: numericAmount,
      note,
      receiptName: receiptName || null,
      receiptData: receiptData || null,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000
    };

    success(res, { tempToken }, 'Transfer OTP sent');
  } catch (err) {
    next(err);
  }
});

router.post('/transfers/verify', verifyToken, authorize('user', 'admin'), async (req, res, next) => {
  try {
    const { tempToken, otp } = req.body;
    const session = global.transferBuffer[tempToken];
    if (!session || session.userId !== req.user.id) throw new ApiError('Invalid transfer session', 400);
    if (session.expiresAt < Date.now()) throw new ApiError('Transfer OTP expired', 400);
    if (session.otp !== otp) throw new ApiError('Invalid OTP', 400);

    const referenceId = `TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const transaction = await Transaction.create({
      senderId: session.senderId,
      amount: session.amount,
      type: 'transfer',
      description: session.note || 'Fund transfer',
      referenceId,
      beneficiaryName: session.recipient,
      receiptName: session.receiptName,
      receiptData: session.receiptData
    });

    delete global.transferBuffer[tempToken];
    const account = await Account.findById(session.senderId);
    success(res, { transaction, account }, 'Transfer completed successfully');
  } catch (err) {
    next(err);
  }
});

router.get('/services/catalog', verifyToken, authorize('user', 'admin'), async (req, res) => {
  success(res, serviceCatalog, 'Service catalog retrieved');
});

router.get('/services', verifyToken, authorize('user', 'admin'), async (req, res, next) => {
  try {
    const services = await ServiceRequest.listByUserId(req.user.id);
    success(res, services, 'Service requests retrieved');
  } catch (err) {
    next(err);
  }
});

router.post('/services', verifyToken, authorize('user', 'admin'), async (req, res, next) => {
  try {
    const { serviceCode, details = {} } = req.body;
    const selectedService = serviceCatalog.find((item) => item.code === serviceCode);
    if (!selectedService) throw new ApiError('Unknown service selected', 400);

    await authService.ensureUserAssets(await User.findUserById(req.user.id));
    const account = await Account.findPrimaryByUserId(req.user.id);
    if (!account) throw new ApiError('Account not found', 404);
    if (selectedService.amount > Number(account.balance)) {
      throw new ApiError('Insufficient balance for this service', 400);
    }

    if (selectedService.amount > 0) {
      const referenceId = `SV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await Transaction.create({
        senderId: account.id,
        amount: selectedService.amount,
        type: 'service',
        description: selectedService.title,
        referenceId,
        beneficiaryName: 'LuxBank Services'
      });
    }

    const service = await ServiceRequest.create({
      userId: req.user.id,
      serviceCode: selectedService.code,
      title: selectedService.title,
      amount: selectedService.amount,
      details
    });

    success(res, service, 'Service request created');
  } catch (err) {
    next(err);
  }
});

router.post('/branch-request', verifyToken, authorize('user', 'admin'), async (req, res, next) => {
  try {
    const { targetBranch } = req.body;
    if (!targetBranch) throw new ApiError('Target branch is required', 400);

    const service = await ServiceRequest.create({
      userId: req.user.id,
      serviceCode: 'branch_change_request',
      title: 'Branch Change Request',
      amount: 0,
      details: { targetBranch }
    });

    success(res, service, 'Branch relocation request submitted');
  } catch (err) {
    next(err);
  }
});

router.post('/security-pin/reset', verifyToken, authorize('user', 'admin'), async (req, res, next) => {
  try {
    const service = await ServiceRequest.create({
      userId: req.user.id,
      serviceCode: 'security_pin_reset',
      title: 'Security Pin Reset Request',
      amount: 0,
      details: { requestedAt: new Date().toISOString() }
    });

    success(res, service, 'Security pin reset request submitted');
  } catch (err) {
    next(err);
  }
});

router.post('/cards/:cardId/action/init', verifyToken, authorize('user', 'admin'), async (req, res, next) => {
  try {
    const { action } = req.body;
    if (!['lock', 'unlock', 'view_cvv'].includes(action)) {
      throw new ApiError('Unsupported card action', 400);
    }

    const user = await User.findUserById(req.user.id);
    const card = await Card.findById(req.params.cardId, req.user.id);
    if (!card) throw new ApiError('Card not found', 404);

    const otp = otpService.generateOTP();
    await otpService.sendOtpEmail(user.email, otp);

    const tempToken = crypto.randomUUID();
    global.cardActionBuffer[tempToken] = {
      userId: req.user.id,
      cardId: Number(req.params.cardId),
      action,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000
    };

    success(res, { tempToken }, 'Card action OTP sent');
  } catch (err) {
    next(err);
  }
});

router.post('/cards/:cardId/action/verify', verifyToken, authorize('user', 'admin'), async (req, res, next) => {
  try {
    const { tempToken, otp } = req.body;
    const session = global.cardActionBuffer[tempToken];
    if (!session || session.userId !== req.user.id || session.cardId !== Number(req.params.cardId)) {
      throw new ApiError('Invalid card action session', 400);
    }
    if (session.expiresAt < Date.now()) throw new ApiError('Card action OTP expired', 400);
    if (session.otp !== otp) throw new ApiError('Invalid OTP', 400);

    const card = await Card.findById(req.params.cardId, req.user.id);
    if (!card) throw new ApiError('Card not found', 404);

    let responseData;
    if (session.action === 'view_cvv') {
      responseData = { cvv: card.cvv, card };
    } else {
      const nextStatus = session.action === 'lock' ? 'inactive' : 'active';
      const updatedCard = await Card.updateStatus(req.params.cardId, req.user.id, nextStatus);
      responseData = { card: updatedCard, status: nextStatus };
    }

    delete global.cardActionBuffer[tempToken];
    success(res, responseData, 'Card action completed');
  } catch (err) {
    next(err);
  }
});

router.post('/deposit', verifyToken, authorize('user', 'admin'), async (req, res, next) => {
  try {
    const { amount, note, receiptName, receiptData } = req.body;
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      throw new ApiError('Deposit amount must be greater than zero', 400);
    }

    await authService.ensureUserAssets(await User.findUserById(req.user.id));
    const account = await Account.findPrimaryByUserId(req.user.id);
    if (!account) throw new ApiError('Account not found', 404);

    const referenceId = `DP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const transaction = await Transaction.createDeposit({
      accountId: account.id,
      amount: numericAmount,
      description: note || 'Self deposit',
      referenceId,
      receiptName: receiptName || null,
      receiptData: receiptData || null
    });

    const updatedAccount = await Account.findById(account.id);
    success(res, { transaction, account: updatedAccount }, 'Deposit completed successfully');
  } catch (err) {
    next(err);
  }
});

router.delete('/account', verifyToken, authorize('user', 'admin'), async (req, res, next) => {
  try {
    const accounts = await Account.findByUserId(req.user.id);
    const accountIds = accounts.map((account) => account.id);

    if (accountIds.length) {
      await db.query(
        'DELETE FROM transactions WHERE sender_account_id = ANY($1::int[]) OR receiver_account_id = ANY($1::int[])',
        [accountIds]
      );
    }

    await User.deleteUserById(req.user.id);
    success(res, null, 'Account deactivated and removed successfully');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
