const crypto = require('crypto');
const { json } = require('./http');

function base64UrlEncode(input) {
  return Buffer.from(input).toString('base64url');
}

function base64UrlDecode(input) {
  return Buffer.from(input, 'base64url').toString('utf8');
}

function safeEqual(a, b) {
  const aBuf = Buffer.from(String(a || ''));
  const bBuf = Buffer.from(String(b || ''));
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function signPayload(payload, secret) {
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

function verifyPayload(token, secret) {
  if (!token || typeof token !== 'string') {
    return { ok: false, reason: 'missing_token' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { ok: false, reason: 'invalid_token' };
  }

  const [encoded, providedSig] = parts;
  const expectedSig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  if (!safeEqual(expectedSig, providedSig)) {
    return { ok: false, reason: 'invalid_signature' };
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encoded));
    if (!payload?.exp || Number.isNaN(Number(payload.exp))) {
      return { ok: false, reason: 'invalid_payload' };
    }

    if (Date.now() > Number(payload.exp)) {
      return { ok: false, reason: 'expired' };
    }

    return { ok: true, payload };
  } catch {
    return { ok: false, reason: 'invalid_payload' };
  }
}

function getBearerToken(req) {
  const auth = req?.headers?.authorization || '';
  if (!auth.startsWith('Bearer ')) return '';
  return auth.slice(7).trim();
}

function requireAdmin(req, res) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    json(res, 500, { ok: false, error: 'ADMIN_SESSION_SECRET is missing' });
    return { ok: false };
  }

  const token = getBearerToken(req);
  const verified = verifyPayload(token, secret);
  if (!verified.ok) {
    json(res, 401, { ok: false, error: 'Unauthorized', reason: verified.reason });
    return { ok: false };
  }

  return { ok: true, payload: verified.payload };
}

module.exports = {
  safeEqual,
  signPayload,
  verifyPayload,
  requireAdmin,
};
