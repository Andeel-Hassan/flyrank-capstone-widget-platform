const pool = require('../db/pool');

async function createSubmission({ widgetId, tenantId, data, ipAddress }) {
  const result = await pool.query(
    `INSERT INTO submissions (widget_id, tenant_id, data, ip_address)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [widgetId, tenantId, JSON.stringify(data), ipAddress]
  );
  return result.rows[0];
}

module.exports = { createSubmission };