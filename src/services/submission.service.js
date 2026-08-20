const widgetRepo = require('../repositories/widget.repository');
const submissionRepo = require('../repositories/submission.repository');
const geoService = require('./geo.service');
const emailService = require('./email.service');

async function submit({ widgetId, data, ipAddress }) {
  const widget = await widgetRepo.getPublicWidgetById(widgetId);

  if (!widget) {
    const err = new Error('Widget not found or inactive');
    err.statusCode = 404;
    throw err;
  }

  // Enrichment failure must never block the submission — degrade, never fail
  const geo = await geoService.enrichWithGeo(ipAddress);

  const submission = await submissionRepo.createSubmission({
    widgetId: widget.id,
    tenantId: widget.tenant_id,
    data,
    ipAddress,
    geoCountry: geo.country,
    geoCity: geo.city,
  });

  // Safe side effect — email failure must NEVER break the submission response
  try {
    await emailService.sendConfirmationEmail({
      to: data.email || 'unknown',
      widgetTitle: widget.title,
    });
  } catch (emailErr) {
    console.warn('Confirmation email failed (non-critical):', emailErr.message);
  }

  return submission;
}

module.exports = { submit };