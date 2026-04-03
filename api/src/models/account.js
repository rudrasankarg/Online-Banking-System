const db = require('../db');

class Account {
  async findByUserId(userId) {
    const result = await db.query(
      'SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_at ASC',
      [userId]
    );
    return result.rows;
  }

  async findPrimaryByUserId(userId) {
    const result = await db.query(
      'SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1',
      [userId]
    );
    return result.rows[0];
  }

  async findByAccountNumber(accNum) {
    const result = await db.query('SELECT * FROM accounts WHERE account_number = $1', [accNum]);
    return result.rows[0];
  }

  async findById(accountId) {
    const result = await db.query('SELECT * FROM accounts WHERE id = $1', [accountId]);
    return result.rows[0];
  }

  async create(accountData) {
    const { userId, type, accountNumber, balance = 0, currency = 'INR' } = accountData;
    const result = await db.query(
      `INSERT INTO accounts (user_id, account_type, account_number, balance, currency) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, type, accountNumber, balance, currency]
    );
    return result.rows[0];
  }

  async updateBalance(accountId, amount) {
    const result = await db.query(
      'UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [amount, accountId]
    );
    return result.rows[0];
  }
}

module.exports = new Account();
