const { signPayload, safeEqual } = require('../_lib/adminAuth');
const { json, methodNotAllowed, readJsonBody, serverError } = require('../_lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!adminPassword || !secret) {
    json(res, 500, {
      ok: false,
      error: 'ADMIN_PASSWORD or ADMIN_SESSION_SECRET is missing',
    });
    return;
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    json(res, 400, { ok: false, error: 'Invalid JSON body' });
    return;
  }

  const provided = String(body?.password || '');
  if (!safeEqual(adminPassword, provided)) {
    json(res, 401, { ok: false, error: 'Invalid password' });
    return;
  }

  try {
    const payload = {
      role: 'admin',
      exp: Date.now() + 1000 * 60 * 60 * 8,
    };

    const token = signPayload(payload, secret);
    json(res, 200, { ok: true, token, expires_at: payload.exp });
  } catch (err) {
    serverError(res, 'Failed to create session token', err.message);
  }
};
