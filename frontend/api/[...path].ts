const BACKEND_ORIGIN = (process.env.BACKEND_PROXY_URL || 'https://morgans-hope-backend.vercel.app')
  .trim()
  .replace(/^['"]|['"]$/g, '')
  .replace(/\/+$/, '');

const HOP_BY_HOP_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'transfer-encoding',
]);

function buildTargetUrl(pathParam: string | string[] | undefined, query: Record<string, unknown>) {
  const parts = Array.isArray(pathParam)
    ? pathParam.flatMap((segment) => String(segment).split('/').filter(Boolean))
    : pathParam
      ? String(pathParam).split('/').filter(Boolean)
      : [];
  const search = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (key === 'path' || value == null) return;

    if (Array.isArray(value)) {
      value.forEach((entry) => search.append(key, String(entry)));
      return;
    }

    search.append(key, String(value));
  });

  const pathname = parts.map((segment) => encodeURIComponent(segment)).join('/');
  const qs = search.toString();
  return `${BACKEND_ORIGIN}/api/${pathname}${qs ? `?${qs}` : ''}`;
}

function buildRequestBody(req: any) {
  if (req.method === 'GET' || req.method === 'HEAD') return undefined;
  if (req.body == null) return undefined;
  if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) return req.body;
  return JSON.stringify(req.body);
}

export default async function handler(req: any, res: any) {
  const targetUrl = buildTargetUrl(req.query?.path, req.query || {});
  const headers = new Headers();

  Object.entries(req.headers || {}).forEach(([key, value]) => {
    if (value == null || HOP_BY_HOP_HEADERS.has(key.toLowerCase())) return;

    if (Array.isArray(value)) {
      value.forEach((entry) => headers.append(key, entry));
      return;
    }

    headers.set(key, String(value));
  });

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: buildRequestBody(req),
    redirect: 'manual',
  });

  const setCookie = (response.headers as any).getSetCookie?.() || [];
  if (setCookie.length) {
    res.setHeader('Set-Cookie', setCookie);
  }

  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') return;
    res.setHeader(key, value);
  });

  const body = Buffer.from(await response.arrayBuffer());
  res.status(response.status).send(body);
}
