function json(res, status, payload) {
  res.status(status).json(payload);
}

function methodNotAllowed(res, allowed) {
  json(res, 405, {
    ok: false,
    error: 'Method not allowed',
    allowed,
  });
}

function serverError(res, message, detail) {
  const payload = { ok: false, error: message || 'Internal server error' };
  if (detail) payload.detail = detail;
  json(res, 500, payload);
}

async function readJsonBody(req) {
  if (!req) return {};

  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string' && req.body.trim()) {
    return JSON.parse(req.body);
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }

  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};

  return JSON.parse(raw);
}

module.exports = {
  json,
  methodNotAllowed,
  serverError,
  readJsonBody,
};
