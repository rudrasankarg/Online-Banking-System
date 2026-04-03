// src/routes/admin.js
const express = require('express');
const router = express.Router();
const { success, error } = require('../utils/response');
const { verifyToken, authorize } = require('../middleware/auth');
const User = require('../models/user');
const authService = require('../services/authService');
const Account = require('../models/account');
const db = require('../db');
const { ApiError } = require('../utils/error');

router.get('/users', verifyToken, authorize('admin'), async (req, res, next) => {
  try {
    const users = await User.listUsers();
    success(res, users, 'Users retrieved successfully');
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:userId/status', verifyToken, authorize('admin'), async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    const { isActive } = req.body;
    if (!Number.isInteger(userId)) {
      throw new ApiError('Invalid user id', 400);
    }

    const existingUser = await User.findUserById(userId);
    if (!existingUser) {
      throw new ApiError('User not found', 404);
    }

    const nextState = Boolean(isActive);
    const updatedUser = await User.updateUserAdminState(userId, {
      isActive: nextState,
      accountStatus: nextState ? 'active' : 'inactive'
    });

    success(res, updatedUser, `User ${nextState ? 'activated' : 'deactivated'} successfully`);
  } catch (err) {
    next(err);
  }
});

router.delete('/users/:userId', verifyToken, authorize('admin'), async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId)) {
      throw new ApiError('Invalid user id', 400);
    }

    const existingUser = await User.findUserById(userId);
    if (!existingUser) {
      throw new ApiError('User not found', 404);
    }

    const accounts = await Account.findByUserId(userId);
    const accountIds = accounts.map((account) => account.id);

    if (accountIds.length) {
      await db.query(
        'DELETE FROM transactions WHERE sender_account_id = ANY($1::int[]) OR receiver_account_id = ANY($1::int[])',
        [accountIds]
      );
    }

    const deletedUser = await User.deleteUserById(userId);
    success(res, deletedUser, 'User deleted successfully');
  } catch (err) {
    next(err);
  }
});

router.get('/transactions', verifyToken, authorize('admin'), async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT t.*, su.name AS sender_name, ru.name AS receiver_name
       FROM transactions t
       LEFT JOIN accounts sa ON sa.id = t.sender_account_id
       LEFT JOIN users su ON su.id = sa.user_id
       LEFT JOIN accounts ra ON ra.id = t.receiver_account_id
       LEFT JOIN users ru ON ru.id = ra.user_id
       ORDER BY t.created_at DESC
       LIMIT 100`
    );

    success(res, result.rows, 'Transactions retrieved successfully');
  } catch (err) {
    next(err);
  }
});

router.post('/admins', verifyToken, authorize('admin'), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw new ApiError('Name, email, and password are required', 400);
    }

    const admin = await authService.createAdmin(req.user.role, { name, email, password });
    success(res, admin, 'Admin created successfully');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
