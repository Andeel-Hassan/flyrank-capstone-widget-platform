const widgetRepo = require('../repositories/widget.repository');
const submissionRepo = require('../repositories/submission.repository');

async function submit({ widgetId, data, ipAddress }) {
  const widget = await widgetRepo.getPublicWidgetById(widgetId);

  if (!widget) {
    const err = new Error('Widget not found or inactive');
    err.statusCode = 404;
    throw err;
  }

  const submission = await submissionRepo.createSubmission({
    widgetId: widget.id,
    tenantId: widget.tenant_id,
    data,
    ipAddress,
  });

  return submission;
}

module.exports = { submit };