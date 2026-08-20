const widgetRepo = require('../repositories/widget.repository');

async function createWidget(tenantId, data) {
  return widgetRepo.createWidget({ tenantId, ...data });
}

async function listWidgets(tenantId) {
  return widgetRepo.getWidgetsByTenant(tenantId);
}

async function getWidget(id, tenantId) {
  const widget = await widgetRepo.getWidgetById(id, tenantId);
  if (!widget) {
    const err = new Error('Widget not found');
    err.statusCode = 404;
    throw err;
  }
  return widget;
}

async function updateWidget(id, tenantId, data) {
  const widget = await widgetRepo.updateWidget(id, tenantId, data);
  if (!widget) {
    const err = new Error('Widget not found');
    err.statusCode = 404;
    throw err;
  }
  return widget;
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