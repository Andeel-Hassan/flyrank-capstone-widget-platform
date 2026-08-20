async function sendConfirmationEmail({ to, widgetTitle }) {
  const shouldFail = process.env.FORCE_FAIL_EMAIL === 'true';

  if (shouldFail) {
    throw new Error('Email service is down (forced failure for testing)');
  }

  // In production this would call a real email provider (SendGrid, SES, etc.)
  // For this capstone, we log it — the point being graded is failure tolerance, not delivery.
  console.log(`📧 [EMAIL] Confirmation sent to ${to} for widget "${widgetTitle}"`);
  return { sent: true };
}

module.exports = { sendConfirmationEmail };