const request = require('supertest');
const app = require('../src/app');

describe('Public Submission Endpoint', () => {
  test('rejects invalid payload with 400', async () => {
    const res = await request(app)
      .post('/api/submissions')
      .send({ widgetId: 1 }); // missing "data" field

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('rejects oversized field value with 413', async () => {
    const res = await request(app)
      .post('/api/submissions')
      .send({
        widgetId: 1,
        data: { email: 'a'.repeat(2000) + '@example.com' },
      });

    expect(res.status).toBe(413);
  });

  test('silently rejects submission when honeypot is filled', async () => {
    const res = await request(app)
      .post('/api/submissions')
      .send({
        widgetId: 1,
        data: { email: 'bot@example.com' },
        website: 'http://spam.com', // honeypot filled = bot
      });

    expect(res.status).toBe(400);
  });

  test('accepts a valid submission', async () => {
    const res = await request(app)
      .post('/api/submissions')
      .send({
        widgetId: 1,
        data: { email: 'validtest@example.com' },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('CORS preflight (OPTIONS) is handled', async () => {
    const res = await request(app)
      .options('/api/submissions')
      .set('Origin', 'http://example.com')
      .set('Access-Control-Request-Method', 'POST');

    expect(res.status).toBeLessThan(300);
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });
});