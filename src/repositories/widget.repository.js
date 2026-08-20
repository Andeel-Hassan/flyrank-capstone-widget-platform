const pool = require('../db/pool');

async function createWidget({ tenantId, type, title, description, fields, buttonText }) {
  const result = await pool.query(
    `INSERT INTO widgets (tenant_id, type, title, description, fields, button_text)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [tenantId, type, title, description, JSON.stringify(fields), buttonText]
  );
  return result.rows[0];
}

async function getWidgetsByTenant(tenantId) {
  const result = await pool.query(
    `SELECT * FROM widgets WHERE tenant_id = $1 ORDER BY created_at DESC`,
    [tenantId]
  );
  return result.rows;
}

async function getWidgetById(id, tenantId) {
  const result = await pool.query(
    `SELECT * FROM widgets WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId]
  );
  return result.rows[0];
}

async function getPublicWidgetById(id) {
  const result = await pool.query(
    `SELECT id, tenant_id, type, title, description, fields, button_text, is_active
     FROM widgets WHERE id = $1 AND is_active = true`,
    [id]
  );
  return result.rows[0];
}

async function updateWidget(id, tenantId, fieldsToUpdate) {
  const { type, title, description, fields, buttonText, isActive } = fieldsToUpdate;
  const result = await pool.query(
    `UPDATE widgets
     SET type = COALESCE($1, type),
         title = COALESCE($2, title),
         description = COALESCE($3, description),
         fields = COALESCE($4, fields),
         button_text = COALESCE($5, button_text),
         is_active = COALESCE($6, is_active),
         updated_at = NOW()
     WHERE id = $7 AND tenant_id = $8
     RETURNING *`,
    [type, title, description, fields ? JSON.stringify(fields) : null, buttonText, isActive, id, tenantId]
  );
  return result.rows[0];
}

async function deleteWidget(id, tenantId) {
  const result = await pool.query(
    `DELETE FROM widgets WHERE id = $1 AND tenant_id = $2 RETURNING id`,
    [id, tenantId]
  );
  return result.rows[0];
}

module.exports = { createWidget, getWidgetsByTenant, getWidgetById, getPublicWidgetById, updateWidget, deleteWidget };