const db = require('../db');

class ServiceRequest {
  async listByUserId(userId) {
    const result = await db.query(
      'SELECT * FROM service_requests WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  async create(serviceData) {
    const { userId, serviceCode, title, amount = 0, details = {} } = serviceData;
    const result = await db.query(
      `INSERT INTO service_requests (user_id, service_code, title, amount, details)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, serviceCode, title, amount, JSON.stringify(details)]
    );
    return result.rows[0];
  }
}

module.exports = new ServiceRequest();
