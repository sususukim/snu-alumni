const crypto = require('crypto');

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signPayload(payload, secret) {
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyToken(token, secret) {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }

  const [encoded, providedSig] = token.split('.');
  if (!encoded || !providedSig) return null;

  const expectedSig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  const validSig = safeEqual(expectedSig, providedSig);
  if (!validSig) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encoded));
    if (!payload?.exp || Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function safeEqual(a, b) {
  const aBuf = Buffer.from(a || '');
  const bBuf = Buffer.from(b || '');
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function parseBearerToken(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return '';
  return auth.slice(7).trim();
}

function requireAdmin(req, res) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'ADMIN_SESSION_SECRET is not set' });
    return false;
  }

  const token = parseBearerToken(req);
  const payload = verifyToken(token, secret);
  if (!payload) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }

  return true;
}

module.exports = {
  signPayload,
  safeEqual,
  requireAdmin,
};
