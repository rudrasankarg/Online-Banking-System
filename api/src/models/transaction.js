const db = require('../db');

class Transaction {
  async create(txData) {
    const {
      senderId,
      receiverId = null,
      amount,
      type,
      description,
      referenceId,
      beneficiaryName,
      receiptName = null,
      receiptData = null
    } = txData;

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const senderAccount = await client.query(
        'SELECT * FROM accounts WHERE id = $1 FOR UPDATE',
        [senderId]
      );
      const account = senderAccount.rows[0];
      if (!account) {
        throw new Error('Sender account not found');
      }
      if (Number(account.balance) < Number(amount)) {
        throw new Error('Insufficient balance');
      }

      const res = await client.query(
        `INSERT INTO transactions (
          sender_account_id, receiver_account_id, amount, transaction_type, description,
          reference_id, status, beneficiary_name, receipt_name, receipt_data
        )
         VALUES ($1, $2, $3, $4, $5, $6, 'completed', $7, $8, $9)
         RETURNING *`,
        [senderId, receiverId, amount, type, description, referenceId, beneficiaryName, receiptName, receiptData]
      );

      await client.query(
        'UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE id = $2',
        [amount, senderId]
      );

      if (receiverId) {
        await client.query(
          'UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2',
          [amount, receiverId]
        );
      }

      await client.query('COMMIT');
      return res.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getHistoryByAccountId(accountId, filters = {}) {
    const conditions = ['sender_account_id = $1 OR receiver_account_id = $1'];
    const params = [accountId];
    let index = 2;

    if (filters.query) {
      conditions.push(`(
        COALESCE(beneficiary_name, '') ILIKE $${index}
        OR COALESCE(description, '') ILIKE $${index}
        OR COALESCE(reference_id, '') ILIKE $${index}
      )`);
      params.push(`%${filters.query}%`);
      index += 1;
    }

    if (filters.type) {
      conditions.push(`transaction_type = $${index}`);
      params.push(filters.type);
      index += 1;
    }

    const result = await db.query(
      `SELECT *
       FROM transactions
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC`,
      params
    );
    return result.rows;
  }

  async createDeposit({ accountId, amount, description = 'Cash deposit', referenceId, receiptName = null, receiptData = null }) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const res = await client.query(
        `INSERT INTO transactions (
          sender_account_id, receiver_account_id, amount, transaction_type, description,
          reference_id, status, beneficiary_name, receipt_name, receipt_data
        )
         VALUES (NULL, $1, $2, 'deposit', $3, $4, 'completed', 'Self Deposit', $5, $6)
         RETURNING *`,
        [accountId, amount, description, referenceId, receiptName, receiptData]
      );

      await client.query(
        'UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE id = $2',
        [amount, accountId]
      );

      await client.query('COMMIT');
      return res.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async findByIdForAccount(transactionId, accountId) {
    const result = await db.query(
      `SELECT *
       FROM transactions
       WHERE id = $1 AND (sender_account_id = $2 OR receiver_account_id = $2)
       LIMIT 1`,
      [transactionId, accountId]
    );
    return result.rows[0];
  }
}

module.exports = new Transaction();
