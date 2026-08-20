const { z } = require('zod');
const submissionService = require('../services/submission.service');

const submitSchema = z.object({
  widgetId: z.union([z.string(), z.number()]),
  data: z.record(z.string(), z.string()).refine(
    (obj) => Object.keys(obj).length <= 20,
    { message: 'Too many fields' }
  ),
  website: z.string().optional(), // honeypot field
});

const MAX_PAYLOAD_FIELD_LENGTH = 1000;

async function submit(req, res) {
  const parsed = submitSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
  }

  const { widgetId, data, website } = parsed.data;

  // Honeypot check — real users never fill this hidden field, bots often do
  if (website && website.trim() !== '') {
    // Silently reject — don't tell the bot why
    return res.status(400).json({ error: 'Submission rejected' });
  }

  // Reject oversized field values
  for (const value of Object.values(data)) {
    if (value.length > MAX_PAYLOAD_FIELD_LENGTH) {
      return res.status(413).json({ error: 'Field value too large' });
    }
  }

  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  try {
    const submission = await submissionService.submit({ widgetId, data, ipAddress });
    res.status(201).json({ success: true, id: submission.id });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

module.exports = { submit };