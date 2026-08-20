const widgetRepo = require('../repositories/widget.repository');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function attachEmbedCode(widget) {
  return {
    ...widget,
    embed_snippet: `<script src="${BASE_URL}/widget.js?id=${widget.id}"></script>`,
  };
}

async function createWidget(tenantId, data) {
  const widget = await widgetRepo.createWidget({ tenantId, ...data });
  return attachEmbedCode(widget);
}

async function listWidgets(tenantId) {
  const widgets = await widgetRepo.getWidgetsByTenant(tenantId);
  return widgets.map(attachEmbedCode);
}

async function getWidget(id, tenantId) {
  const widget = await widgetRepo.getWidgetById(id, tenantId);
  if (!widget) {
    const err = new Error('Widget not found');
    err.statusCode = 404;
    throw err;
  }
  return attachEmbedCode(widget);
}

async function updateWidget(id, tenantId, data) {
  const widget = await widgetRepo.updateWidget(id, tenantId, data);
  if (!widget) {
    const err = new Error('Widget not found');
    err.statusCode = 404;
    throw err;
  }
  return attachEmbedCode(widget);
}

async function deleteWidget(id, tenantId) {
  const deleted = await widgetRepo.deleteWidget(id, tenantId);
  if (!deleted) {
    const err = new Error('Widget not found');
    err.statusCode = 404;
    throw err;
  }
  return deleted;
}

module.exports = { createWidget, listWidgets, getWidget, updateWidget, deleteWidget };