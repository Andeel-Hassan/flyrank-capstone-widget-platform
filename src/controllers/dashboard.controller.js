const dashboardService = require('../services/dashboard.service');

async function getSubmissions(req, res) {
  const { widgetId, limit, offset } = req.query;

  const submissions = await dashboardService.listSubmissions(req.tenantId, {
    widgetId: widgetId ? Number(widgetId) : undefined,
    limit: limit ? Number(limit) : 50,
    offset: offset ? Number(offset) : 0,
  });

  res.status(200).json(submissions);
}

async function getStats(req, res) {
  const stats = await dashboardService.getStats(req.tenantId);
  res.status(200).json(stats);
}

module.exports = { getSubmissions, getStats };