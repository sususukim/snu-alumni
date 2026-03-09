const { json, methodNotAllowed } = require('./_lib/http');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    methodNotAllowed(res, ['GET']);
    return;
  }

  json(res, 410, {
    ok: false,
    error: 'public-config endpoint is deprecated. Frontend no longer uses direct Supabase access.',
  });
};
