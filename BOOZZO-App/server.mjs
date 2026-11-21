// Serveur BOOZZO, au format « worker » : export default { fetch(req, env) }.
// env.BUCKET   stockage clé/valeur (R2 en ligne, SQLite en local via dev.mjs)
// env.ASSISTANT fonction async (messages) => { reply } fournie par l'hôte, absente si non configurée
// FILES est injecté par build.mjs (contenu du dossier ui/).

const json = (data, status = 200) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const CALL_LIFETIME_MS = 60 * 60 * 1000;
const SIGNAL_TYPES = ['join', 'offer', 'answer', 'bye'];
const PEERS = ['eye', 'guest'];

// Limite simple contre les abus de l'assistant : par instance du serveur.
const chatWindow = { start: 0, count: 0 };
function chatAllowed() {
  const now = Date.now();
  if (now - chatWindow.start > 60000) Object.assign(chatWindow, { start: now, count: 0 });
  return ++chatWindow.count <= 30;
}

async function readCall(bucket, id) {
  if (!UUID.test(id)) return null;
  const saved = await bucket.get('calls/' + id);
  if (!saved) return null;
  const call = await saved.json();
  return Date.now() > call.expires ? null : call;
}

async function chat(req, env) {
  if (!env.ASSISTANT) return json({ error: 'assistant_non_configure' }, 503);
  if (!chatAllowed()) return json({ error: 'trop_de_demandes' }, 429);
  const body = await req.json();
  const messages = body?.messages;
  const valid =
    Array.isArray(messages) &&
    messages.length > 0 &&
    messages.length <= 24 &&
    messages[0].role === 'user' &&
    messages.every(
      (m) =>
        ['user', 'assistant'].includes(m?.role) &&
        typeof m.content === 'string' &&
        m.content.trim() &&
        m.content.length <= 2000,
    );
  if (!valid) return json({ error: 'demande_invalide' }, 400);
  const result = await env.ASSISTANT(messages.map(({ role, content }) => ({ role, content })));
  return result.error ? json({ error: result.error }, result.status || 502) : json({ reply: result.reply });
}

async function calls(req, env, parts) {
  const bucket = env.BUCKET;
  const post = req.method === 'POST';

  // POST /api/calls : ouvrir un appel
  if (parts.length === 0) {
    if (!post) return json({}, 405);
    const call = { id: crypto.randomUUID(), expires: Date.now() + CALL_LIFETIME_MS };
    await bucket.put('calls/' + call.id, JSON.stringify(call));
    return json(call, 201);
  }

  const call = await readCall(bucket, parts[0]);
  if (!call) return json({ error: 'appel_introuvable' }, 404);
  if (parts.length === 1) return post ? json({}, 405) : json(call);
  if (parts[1] !== 'signal' || parts.length !== 2) return json({}, 404);
  const prefix = 'calls/' + call.id + '/sig/';

  // POST /api/calls/:id/signal : déposer un message de signalisation
  if (post) {
    const d = await req.json();
    const sdpOk = d.sdp === undefined || (typeof d.sdp === 'string' && d.sdp.length <= 30000);
    if (!PEERS.includes(d.from) || !SIGNAL_TYPES.includes(d.type) || !sdpOk) return json({}, 400);
    const key = prefix + String(Date.now()).padStart(15, '0') + '-' + crypto.randomUUID();
    await bucket.put(key, JSON.stringify({ from: d.from, type: d.type, sdp: d.sdp }));
    return json({ ok: true }, 201);
  }

  // GET /api/calls/:id/signal?for=eye&after=<clé> : lire les messages de l'autre appareil
  const url = new URL(req.url);
  const me = url.searchParams.get('for');
  const after = url.searchParams.get('after') || '';
  if (!PEERS.includes(me)) return json({}, 400);
  const listed = await bucket.list({ prefix });
  const keys = listed.objects.map((o) => o.key).filter((k) => k > after).sort();
  const messages = [];
  for (const key of keys) {
    const saved = await bucket.get(key);
    if (!saved) continue;
    const message = await saved.json();
    if (message.from !== me) messages.push(message);
  }
  return json({ messages, cursor: keys.length ? keys[keys.length - 1] : after });
}

async function api(req, env, path) {
  const post = req.method === 'POST';
  if (req.method !== 'GET' && !post) return json({}, 405);
  const origin = req.headers.get('origin');
  if (post && origin && origin !== new URL(req.url).origin) return json({}, 403);
  if (post && Number(req.headers.get('content-length')) > 100000) return json({}, 413);

  if (path === '/api/config') return json({ assistant: Boolean(env.ASSISTANT) });
  if (path === '/api/chat') return post ? chat(req, env) : json({}, 405);
  if (path === '/api/calls' || path.startsWith('/api/calls/'))
    return calls(req, env, path.split('/').slice(3).filter(Boolean));
  return json({}, 404);
}

export default {
  async fetch(req, env) {
    try {
      const path = new URL(req.url).pathname;
      if (path.startsWith('/api/')) return await api(req, env, path);
      const asset = FILES[path === '/' ? '/index.html' : path];
      if (!asset) return new Response('Introuvable', { status: 404 });
      return new Response(Uint8Array.from(atob(asset[1]), (c) => c.charCodeAt(0)), {
        headers: { 'Content-Type': asset[0], 'X-Content-Type-Options': 'nosniff' },
      });
    } catch {
      return json({ error: 'service_indisponible' }, 503);
    }
  },
};
