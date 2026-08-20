const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createTenant, findTenantByEmail } = require('../repositories/tenant.repository');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

async function signup({ name, email, password }) {
  const existing = await findTenantByEmail(email);
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const tenant = await createTenant({ name, email, passwordHash });

  const token = jwt.sign({ tenantId: tenant.id }, JWT_SECRET, { expiresIn: '7d' });
  return { tenant, token };
}

async function login({ email, password }) {
  const tenant = await findTenantByEmail(email);
  if (!tenant) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, tenant.password_hash);
  if (!valid) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = jwt.sign({ tenantId: tenant.id }, JWT_SECRET, { expiresIn: '7d' });
  return { tenant: { id: tenant.id, name: tenant.name, email: tenant.email }, token };
}

module.exports = { signup, login };