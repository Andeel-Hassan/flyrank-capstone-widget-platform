const pool = require('../db/pool');

async function getSubmissionsByTenant(tenantId, { widgetId, limit = 50, offset = 0 } = {}) {
  let query = `
    SELECT s.id, s.widget_id, w.title AS widget_title, s.data, s.ip_address,
           s.geo_country, s.geo_city, s.created_at
    FROM submissions s
    JOIN widgets w ON w.id = s.widget_id
    WHERE s.tenant_id = $1
  `;
  const params = [tenantId];

  if (widgetId) {
    params.push(widgetId);
    query += ` AND s.widget_id = $${params.length}`;
  }

  query += ` ORDER BY s.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
}

async function getStatsByTenant(tenantId) {
  const totalResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM submissions WHERE tenant_id = $1`,
    [tenantId]
  );

  const perWidgetResult = await pool.query(
    `SELECT w.id AS widget_id, w.title, COUNT(s.id)::int AS submission_count
     FROM widgets w
     LEFT JOIN submissions s ON s.widget_id = w.id
     WHERE w.tenant_id = $1
     GROUP BY w.id, w.title
     ORDER BY submission_count DESC`,
    [tenantId]
  );

  const geoResult = await pool.query(
    `SELECT geo_country, COUNT(*)::int AS count
     FROM submissions
     WHERE tenant_id = $1 AND geo_country IS NOT NULL
     GROUP BY geo_country
     ORDER BY count DESC`,
    [tenantId]
  );

  const dailyResult = await pool.query(
    `SELECT DATE(created_at) AS date, COUNT(*)::int AS count
     FROM submissions
     WHERE tenant_id = $1
     GROUP BY DATE(created_at)
     ORDER BY date DESC
     LIMIT 30`,
    [tenantId]
  );

  return {
    total: totalResult.rows[0].total,
    perWidget: perWidgetResult.rows,
    geoBreakdown: geoResult.rows,
    dailyCounts: dailyResult.rows,
  };
}

module.exports = { getSubmissionsByTenant, getStatsByTenant };