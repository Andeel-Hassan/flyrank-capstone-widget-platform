const { z } = require('zod');
const widgetService = require('../services/widget.service');

const createSchema = z.object({
  type: z.enum(['signup-form', 'cta-popover']),
  title: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(z.object({
    name: z.string(),
    label: z.string(),
    type: z.string(),
    required: z.boolean().optional(),
  })).default([]),
  buttonText: z.string().default('Submit'),
});

const updateSchema = createSchema.partial().extend({
  isActive: z.boolean().optional(),
});

async function create(req, res) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
  }

  const widget = await widgetService.createWidget(req.tenantId, parsed.data);
  res.status(201).json(widget);
}

async function list(req, res) {
  const widgets = await widgetService.listWidgets(req.tenantId);
  res.status(200).json(widgets);
}

async function getOne(req, res) {
  try {
    const widget = await widgetService.getWidget(req.params.id, req.tenantId);
    res.status(200).json(widget);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

async function update(req, res) {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
  }

  try {
    const widget = await widgetService.updateWidget(req.params.id, req.tenantId, parsed.data);
    res.status(200).json(widget);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

async function remove(req, res) {
  try {
    await widgetService.deleteWidget(req.params.id, req.tenantId);
    res.status(204).send();
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

module.exports = { create, list, getOne, update, remove };