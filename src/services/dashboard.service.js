const dashboardRepo = require('../repositories/dashboard.repository');

async function listSubmissions(tenantId, options) {
  return dashboardRepo.getSubmissionsByTenant(tenantId, options);
}

async function getStats(tenantId) {
  return dashboardRepo.getStatsByTenant(tenantId);
}

module.exports = { listSubmissions, getStats };