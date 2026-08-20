const { z } = require('zod');
const authService = require('../services/auth.service');

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

async function signup(req, res) {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
  }

  try {
    const { tenant, token } = await authService.signup(parsed.data);
    res.status(201).json({ tenant, token });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
  }

  try {
    const { tenant, token } = await authService.login(parsed.data);
    res.status(200).json({ tenant, token });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

module.exports = { signup, login };