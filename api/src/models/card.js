const db = require('../db');

class Card {
  async findByUserId(userId) {
    const result = await db.query(
      `SELECT c.*, a.account_number
       FROM cards c
       JOIN accounts a ON a.id = c.account_id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  async findById(cardId, userId) {
    const result = await db.query(
      `SELECT c.*, a.account_number
       FROM cards c
       JOIN accounts a ON a.id = c.account_id
       WHERE c.id = $1 AND c.user_id = $2
       LIMIT 1`,
      [cardId, userId]
    );
    return result.rows[0];
  }

  async create(cardData) {
    const { accountId, userId, cardNumber, cardType, expiryDate, cvv, creditLimit = 50000 } = cardData;
    const result = await db.query(
      `INSERT INTO cards (account_id, user_id, card_number, card_type, expiry_date, cvv, status, credit_limit)
       VALUES ($1, $2, $3, $4, $5, $6, 'active', $7)
       RETURNING *`,
      [accountId, userId, cardNumber, cardType, expiryDate, cvv, creditLimit]
    );
    return result.rows[0];
  }

  async updateStatus(cardId, userId, status) {
    const result = await db.query(
      `UPDATE cards
       SET status = $3
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [cardId, userId, status]
    );
    return result.rows[0];
  }
}

module.exports = new Card();
