const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/user');
const Account = require('../models/account');
const Card = require('../models/card');
const { ApiError } = require('../utils/error');
const otpService = require('./otpService');

global.authBuffer = global.authBuffer || {}; // In-memory store for OTP requests
global.passwordResetBuffer = global.passwordResetBuffer || {};
global.transferBuffer = global.transferBuffer || {};
global.cardActionBuffer = global.cardActionBuffer || {};

class AuthService {
  normalizeEmail(email) {
    return email ? email.trim().toLowerCase() : email;
  }

  sanitizeAuthEntity(entity) {
    if (!entity) return null;
    const safeEntity = { ...entity };
    delete safeEntity.password_hash;
    return safeEntity;
  }

  generateAccountNumber() {
    return `44${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`;
  }

  generateCardNumber() {
    return `5234${Math.floor(100000000000 + Math.random() * 900000000000)}`;
  }

  generateExpiryDate() {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 4);
    return date.toISOString().slice(0, 10);
  }

  generateCvv() {
    return String(Math.floor(100 + Math.random() * 900));
  }

  async ensureUserAssets(user) {
    if (!user || user.role !== 'user') {
      return { user, account: null, cards: [] };
    }

    let account = await Account.findPrimaryByUserId(user.id);
    if (!account) {
      account = await Account.create({
        userId: user.id,
        type: user.accountType || 'domestic',
        accountNumber: this.generateAccountNumber(),
        balance: 432150,
        currency: 'INR'
      });
    }

    let cards = await Card.findByUserId(user.id);
    if (!cards.length) {
      await Card.create({
        accountId: account.id,
        userId: user.id,
        cardNumber: this.generateCardNumber(),
        cardType: 'Visa Signature',
        expiryDate: this.generateExpiryDate(),
        cvv: this.generateCvv(),
        creditLimit: 50000
      });
      cards = await Card.findByUserId(user.id);
    }

    let hydratedUser = user;
    if (user.accountStatus !== 'active') {
      hydratedUser = await User.updateUserAccountStatus(user.id, 'active');
    }

    return { user: hydratedUser, account, cards };
  }

  async ensureDefaultAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'LuxBank Administrator';

    if (!adminEmail || !adminPassword) {
      return;
    }

    const existingAdmin = await User.findAdminByEmail(adminEmail);
    if (existingAdmin) {
      return;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await User.createAdmin({
      name: adminName,
      email: adminEmail,
      passwordHash
    });

    console.log(`[Admin Seed] Default admin available at ${adminEmail}`);
  }

  async initRegister(userData) {
    const normalizedEmail = this.normalizeEmail(userData.email);
    const normalizedPhone = userData.phone ? userData.phone.trim() : '';
    const normalizedName = userData.name ? userData.name.trim().replace(/\s+/g, ' ') : '';

    const existingUser = await User.findUserByEmail(normalizedEmail);
    if (existingUser) {
      throw new ApiError('User already exists with this email', 400);
    }

    const activeRegisterSession = Object.values(global.authBuffer).find(
      (session) => session.type === 'register' && this.normalizeEmail(session.userData.email) === normalizedEmail && session.expiresAt > Date.now()
    );
    if (activeRegisterSession) {
      throw new ApiError('A registration is already pending for this email. Please verify the OTP.', 400);
    }
    
    // Simulate real backend OTP dispatch mapping
    const otp = otpService.generateOTP();
    await otpService.sendOtpEmail(normalizedEmail, otp);
    if (normalizedPhone) {
       await otpService.sendOtpSms(normalizedPhone, otp);
    }

    const tempToken = crypto.randomUUID();
    global.authBuffer[tempToken] = {
       type: 'register',
       userData: {
         ...userData,
         name: normalizedName,
         email: normalizedEmail,
         phone: normalizedPhone
       },
       otp,
       expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    };

    return { tempToken, message: `OTP mapped for backend distribution` };
  }

  async verifyRegister(tempToken, otp) {
    const session = global.authBuffer[tempToken];
    if (!session || session.type !== 'register') throw new ApiError('Invalid or expired session', 400);
    if (session.expiresAt < Date.now()) throw new ApiError('OTP Expired', 400);
    if (session.otp !== otp) throw new ApiError('Invalid OTP', 400);

    const userData = session.userData;
    const existingUser = await User.findUserByEmail(userData.email);
    if (existingUser) {
      delete global.authBuffer[tempToken];
      throw new ApiError('User already exists with this email', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    let newUser;
    try {
      newUser = await User.createUser({
        name: userData.name,
        email: userData.email,
        passwordHash,
        role: 'user',
        phone: userData.phone,
        country: userData.country,
        accountType: userData.accountType || 'domestic',
        accountStatus: 'active'
      });
    } catch (err) {
      if (err.code === '23505') {
        delete global.authBuffer[tempToken];
        throw new ApiError('User already exists with this email', 400);
      }
      throw err;
    }

    await this.ensureUserAssets(newUser);

    delete global.authBuffer[tempToken];
    const token = this.generateToken(newUser);
    return { user: this.sanitizeAuthEntity(newUser), token };
  }

  async initLogin(email, password, requiredRole = 'user') {
    const normalizedEmail = this.normalizeEmail(email);
    if (requiredRole === 'admin') {
      const allowedAdminEmail = this.normalizeEmail(process.env.ADMIN_EMAIL);
      if (!allowedAdminEmail || normalizedEmail !== allowedAdminEmail) {
        throw new ApiError('This admin portal is restricted to the primary administrator only', 403);
      }
    }

    const user = requiredRole === 'admin'
      ? await User.findAdminByEmail(normalizedEmail)
      : await User.findUserByEmail(normalizedEmail);

    if (!user) throw new ApiError('Invalid email or password', 401);
    if (user.role !== requiredRole && requiredRole !== 'any') throw new ApiError('Unauthorized role access', 403);
    if (!user.password_hash) throw new ApiError('Account credentials are unavailable. Please register again.', 400);

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new ApiError('Invalid email or password', 401);

    const otp = otpService.generateOTP();
    await otpService.sendOtpEmail(normalizedEmail, otp);

    const tempToken = crypto.randomUUID();
    global.authBuffer[tempToken] = {
       type: 'login',
       user,
       otp,
       expiresAt: Date.now() + 10 * 60 * 1000
    };

    return { tempToken, requireOtp: true };
  }

  async verifyLogin(tempToken, otp) {
    const session = global.authBuffer[tempToken];
    if (!session || session.type !== 'login') throw new ApiError('Invalid or expired session', 400);
    if (session.expiresAt < Date.now()) throw new ApiError('OTP Expired', 400);
    if (session.otp !== otp) throw new ApiError('Invalid OTP', 400);

    let user = session.user;
    delete global.authBuffer[tempToken];

    if (user.role === 'user') {
      const ensured = await this.ensureUserAssets(user);
      user = ensured.user;
    }

    const token = this.generateToken(user);
    return { user: this.sanitizeAuthEntity(user), token };
  }

  async requestPasswordReset(email) {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await User.findUserByEmail(normalizedEmail);
    if (!user) {
      return { message: 'If the email is registered, a recovery link has been sent.' };
    }

    const resetToken = crypto.randomUUID();
    const resetLinkBase = process.env.WEB_BASE_URL || 'http://localhost:3000';
    const resetLink = `${resetLinkBase}/reset-password?token=${resetToken}`;

    global.passwordResetBuffer[resetToken] = {
      email: normalizedEmail,
      expiresAt: Date.now() + 30 * 60 * 1000
    };

    await otpService.sendPasswordResetEmail(normalizedEmail, resetLink);

    return { message: 'If the email is registered, a recovery link has been sent.' };
  }

  async resetPassword(resetToken, password) {
    const session = global.passwordResetBuffer[resetToken];
    if (!session) throw new ApiError('Invalid or expired reset link', 400);
    if (session.expiresAt < Date.now()) {
      delete global.passwordResetBuffer[resetToken];
      throw new ApiError('Reset link has expired', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const updatedUser = await User.updateUserPassword(session.email, passwordHash);

    delete global.passwordResetBuffer[resetToken];

    if (!updatedUser) {
      throw new ApiError('Unable to update password for this account', 400);
    }

    return { message: 'Password updated successfully.' };
  }

  async createAdmin(creatorRole, adminData) {
    throw new ApiError('Additional admin creation is disabled. Only the primary administrator can access this portal.', 403);
  }

  generateToken(user) {
    return jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }
}

module.exports = new AuthService();
