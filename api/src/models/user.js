const db = require('../db');

function normalizeEmail(email) {
  return email ? email.trim().toLowerCase() : email;
}

function mapUser(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password_hash: row.password_hash,
    role: row.role,
    phone: row.phone,
    country: row.country,
    accountType: row.account_type,
    accountStatus: row.account_status,
    notificationsEnabled: row.notifications_enabled,
    twoFactorEnabled: row.two_factor_enabled,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function mapAdmin(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password_hash: row.password_hash,
    role: 'admin',
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

async function createUser(user) {
  const { name, email, passwordHash, role = 'user', phone, country, accountType = 'domestic', accountStatus = 'active' } = user;
  const normalizedEmail = normalizeEmail(email);

  const result = await db.query(
    `INSERT INTO users (name, email, password_hash, role, phone, country, account_type, account_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [name, normalizedEmail, passwordHash, role, phone || null, country || null, accountType, accountStatus]
  );

  return mapUser(result.rows[0]);
}

async function findUserByEmail(email) {
  const result = await db.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1', [normalizeEmail(email)]);
  return mapUser(result.rows[0]);
}

async function findUserById(id) {
  const result = await db.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
  return mapUser(result.rows[0]);
}

async function updateUserPassword(email, passwordHash) {
  const result = await db.query(
    `UPDATE users
     SET password_hash = $2, updated_at = NOW()
     WHERE LOWER(email) = LOWER($1)
     RETURNING *`,
    [normalizeEmail(email), passwordHash]
  );

  return mapUser(result.rows[0]);
}

async function updateUserAccountStatus(userId, accountStatus) {
  const result = await db.query(
    `UPDATE users
     SET account_status = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [userId, accountStatus]
  );
  return mapUser(result.rows[0]);
}

async function updateUserProfile(userId, profile) {
  const { name, country } = profile;
  const result = await db.query(
    `UPDATE users
     SET name = $2, country = $3, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [userId, name, country]
  );
  return mapUser(result.rows[0]);
}

async function updateUserPreferences(userId, preferences) {
  const { notificationsEnabled, twoFactorEnabled } = preferences;
  const result = await db.query(
    `UPDATE users
     SET notifications_enabled = $2, two_factor_enabled = $3, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [userId, notificationsEnabled, twoFactorEnabled]
  );
  return mapUser(result.rows[0]);
}

async function updateUserAdminState(userId, adminState) {
  const { isActive, accountStatus } = adminState;
  const result = await db.query(
    `UPDATE users
     SET is_active = $2, account_status = $3, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [userId, isActive, accountStatus]
  );
  return mapUser(result.rows[0]);
}

async function deleteUserById(userId) {
  const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);
  return mapUser(result.rows[0]);
}

async function listUsers() {
  const result = await db.query(
    `SELECT id, name, email, role, phone, country, account_type, account_status, is_active, created_at
     FROM users
     ORDER BY created_at DESC`
  );

  return result.rows.map(mapUser);
}

async function findAdminByEmail(email) {
  const result = await db.query('SELECT * FROM admins WHERE LOWER(email) = LOWER($1) LIMIT 1', [normalizeEmail(email)]);
  return mapAdmin(result.rows[0]);
}

async function createAdmin(admin) {
  const { name, email, passwordHash } = admin;
  const normalizedEmail = normalizeEmail(email);
  const result = await db.query(
    `INSERT INTO admins (name, email, password_hash)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
     RETURNING *`,
    [name, normalizedEmail, passwordHash]
  );

  return mapAdmin(result.rows[0]);
}

async function listAdmins() {
  const result = await db.query(
    `SELECT id, name, email, is_active, created_at
     FROM admins
     ORDER BY created_at DESC`
  );

  return result.rows.map(mapAdmin);
}

module.exports = {
  createUser,
  findUserById,
  findUserByEmail,
  updateUserPassword,
  updateUserAccountStatus,
  updateUserProfile,
  updateUserPreferences,
  updateUserAdminState,
  deleteUserById,
  listUsers,
  findAdminByEmail,
  createAdmin,
  listAdmins
};
