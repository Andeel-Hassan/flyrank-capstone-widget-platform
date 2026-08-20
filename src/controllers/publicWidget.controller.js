const widgetRepo = require('../repositories/widget.repository');

async function getConfig(req, res) {
  const widget = await widgetRepo.getPublicWidgetById(req.params.id);

  if (!widget) {
    return res.status(404).json({ error: 'Widget not found' });
  }

  // Short-lived cache — config can change, but no need to refetch every request
  res.set('Cache-Control', 'public, max-age=60');
  res.status(200).json(widget);
}

module.exports = { getConfig };