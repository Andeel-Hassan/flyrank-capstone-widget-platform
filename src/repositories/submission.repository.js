const pool = require('../db/pool');

async function createSubmission({ widgetId, tenantId, data, ipAddress, geoCountry, geoCity }) {
  const result = await pool.query(
    `INSERT INTO submissions (widget_id, tenant_id, data, ip_address, geo_country, geo_city)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [widgetId, tenantId, JSON.stringify(data), ipAddress, geoCountry, geoCity]
  );
  return result.rows[0];
}

module.exports = { createSubmission };