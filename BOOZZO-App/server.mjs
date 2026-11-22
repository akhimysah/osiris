// Serveur BOOZZO, au format « worker » : export default { fetch(req, env) }.
// env.BUCKET   stockage clé/valeur (R2 en ligne, SQLite en local via dev.mjs)
// env.TURN     relais facultatif pour les appels : { urls, username, credential }
// env.YOUTUBE_KEY clé de l'API YouTube Data v3, pour la recherche de vidéos (facultative)
// env.ASSISTANT fonction async (messages) => { reply } fournie par l'hôte, absente si non configurée
// FILES est injecté par build.mjs (contenu du dossier ui/).

const json = (data, status = 200) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });

// Corps JSON de la requête, ou null s'il est absent ou invalide.
const body = (req) => req.json().then((d) => (d && typeof d === 'object' ? d : null), () => null);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const CALL_LIFETIME_MS = 60 * 60 * 1000;
const MAX_SIGNALS = 40; // messages de signalisation par appel
const SIGNAL_TYPES = ['join', 'offer', 'answer', 'bye'];
const PEERS = ['eye', 'guest'];

// Limites de l'assistant, tenues dans le stockage pour valoir sur toutes les instances du serveur.
const CHAT_PER_DEVICE_PER_MINUTE = 10;
const CHAT_PER_DAY = 2000;
async function bump(bucket, key, limit) {
  const saved = await bucket.get(key);
  const count = saved ? Number((await saved.json()).count) || 0 : 0;
  if (count >= limit) return false;
  await bucket.put(key, JSON.stringify({ count: count + 1 }));
  return true;
}
async function chatAllowed(bucket, device) {
  const now = new Date().toISOString();
  return (
    (await bump(bucket, `rate/${device}/${now.slice(0, 16)}`, CHAT_PER_DEVICE_PER_MINUTE)) &&
    (await bump(bucket, `rate/day/${now.slice(0, 10)}`, CHAT_PER_DAY))
  );
}

async function readCall(bucket, id) {
  if (!UUID.test(id)) return null;
  const saved = await bucket.get('calls/' + id);
  if (!saved) return null;
  const call = await saved.json();
  return call.ended || Date.now() > call.expires ? null : call;
}

async function chat(req, env) {
  if (!env.ASSISTANT) return json({ error: 'assistant_non_configure' }, 503);
  // Seule la page de l'application, depuis un appareil BOOZZO identifié, peut parler à l'assistant.
  if (!req.headers.get('origin')) return json({}, 403);
  const d = await body(req);
  if (!UUID.test(d?.device)) return json({ error: 'demande_invalide' }, 400);
  if (!(await chatAllowed(env.BUCKET, d.device))) return json({ error: 'trop_de_demandes' }, 429);
  const messages = d.messages;
  const valid =
    Array.isArray(messages) &&
    messages.length > 0 &&
    messages.length <= 12 &&
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
    const d = await body(req);
    const sdpOk = d?.sdp === undefined || (typeof d.sdp === 'string' && d.sdp.length <= 30000);
    if (!d || !PEERS.includes(d.from) || !SIGNAL_TYPES.includes(d.type) || !sdpOk) return json({}, 400);
    if ((await bucket.list({ prefix })).objects.length >= MAX_SIGNALS) return json({}, 429);
    // Après un « bye », l'appel est clos : personne ne peut plus le rejoindre.
    if (d.type === 'bye') await bucket.put('calls/' + call.id, JSON.stringify({ ...call, ended: true }));
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

// Proches : chaque proche a un lien permanent. Une « sonnerie » relie un appel à un proche.
// ring.from vaut 'eye' quand BOOZZO appelle le proche, 'guest' quand le proche appelle BOOZZO.
const RING_MS = 45000;
const publicContact = (c) => ({
  id: c.id,
  name: c.name,
  ring: c.ring && Date.now() - c.ring.at < RING_MS ? { call: c.ring.call, from: c.ring.from } : null,
});
async function readContact(bucket, id) {
  if (!UUID.test(id)) return null;
  const saved = await bucket.get('contacts/' + id);
  const contact = saved && (await saved.json());
  return contact && !contact.removed ? contact : null;
}
async function contacts(req, env, parts) {
  const bucket = env.BUCKET;
  const post = req.method === 'POST';

  // POST /api/contacts : ajouter un proche à un appareil BOOZZO
  if (parts.length === 0) {
    if (!post) return json({}, 405);
    const d = await body(req);
    const name = typeof d?.name === 'string' ? d.name.trim().slice(0, 30) : '';
    if (!UUID.test(d?.device) || !name) return json({}, 400);
    const contact = { id: crypto.randomUUID(), name, device: d.device, ring: null };
    await bucket.put('contacts/' + contact.id, JSON.stringify(contact));
    await bucket.put('devices/' + d.device + '/contacts/' + contact.id, '1');
    return json(publicContact(contact), 201);
  }

  const contact = await readContact(bucket, parts[0]);
  if (!contact) return json({ error: 'proche_introuvable' }, 404);
  if (parts.length === 1) return post ? json({}, 405) : json(publicContact(contact));
  if (!post || parts.length !== 2) return json({}, 404);
  const d = await body(req);
  if (!d) return json({}, 400);

  // POST /api/contacts/:id/ring : faire sonner ({ call, from }) ou arrêter la sonnerie de cet appel ({ call: null, if })
  if (parts[1] === 'ring') {
    if (d.call === null) {
      // On n'efface que la sonnerie de l'appel nommé : l'autre côté a pu en lancer une autre entre-temps.
      if (!UUID.test(d.if)) return json({}, 400);
      if (contact.ring?.call !== d.if) return json(publicContact(contact));
      contact.ring = null;
    } else {
      if (!UUID.test(d.call) || !PEERS.includes(d.from)) return json({}, 400);
      contact.ring = { call: d.call, from: d.from, at: Date.now() };
    }
  } else if (parts[1] === 'remove') {
    if (d.device !== contact.device) return json({}, 403);
    contact.removed = true;
  } else return json({}, 404);
  await bucket.put('contacts/' + contact.id, JSON.stringify(contact));
  return json(publicContact(contact));
}
// GET /api/devices/:device/rings : appels entrants des proches pour cet appareil BOOZZO
async function deviceRings(env, device) {
  if (!UUID.test(device)) return json({}, 400);
  const prefix = 'devices/' + device + '/contacts/';
  const listed = await env.BUCKET.list({ prefix });
  const rings = [];
  for (const { key } of listed.objects) {
    const contact = await readContact(env.BUCKET, key.slice(prefix.length));
    const ring = contact && publicContact(contact).ring;
    if (ring?.from === 'guest') rings.push({ contact: contact.id, name: contact.name, call: ring.call });
  }
  return json({ rings });
}

// GET /api/youtube?q=… : recherche de vidéos YouTube intégrables, filtrée « contenu sûr ».
// Le quota gratuit de l'API est d'environ cent recherches par jour : chaque recherche est gardée une journée.
async function youtubeSearch(req, env) {
  if (!env.YOUTUBE_KEY) return json({ error: 'youtube_non_configure' }, 503);
  const q = (new URL(req.url).searchParams.get('q') || '').trim().toLowerCase().slice(0, 80);
  if (q.length < 2) return json({ error: 'demande_invalide' }, 400);
  const key = 'youtube/' + encodeURIComponent(q);
  const saved = await env.BUCKET.get(key);
  const cached = saved && (await saved.json());
  if (cached && Date.now() - cached.at < 24 * 60 * 60 * 1000) return json({ videos: cached.videos });
  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.search = new URLSearchParams({ part: 'snippet', type: 'video', videoEmbeddable: 'true', safeSearch: 'strict', maxResults: '6', relevanceLanguage: 'fr', q, key: env.YOUTUBE_KEY });
  const response = await fetch(url);
  if (!response.ok) return json({ error: response.status === 403 ? 'youtube_quota' : 'youtube_indisponible' }, 502);
  const data = await response.json();
  const videos = (data.items || [])
    .filter((item) => /^[\w-]{11}$/.test(item.id?.videoId || ''))
    .map((item) => ({ id: item.id.videoId, title: String(item.snippet?.title || '').slice(0, 120), channel: String(item.snippet?.channelTitle || '').slice(0, 60) }));
  await env.BUCKET.put(key, JSON.stringify({ at: Date.now(), videos }));
  return json({ videos });
}

async function api(req, env, path) {
  const post = req.method === 'POST';
  if (req.method !== 'GET' && !post) return json({}, 405);
  const origin = req.headers.get('origin');
  if (post && origin && origin !== new URL(req.url).origin) return json({}, 403);
  if (post && Number(req.headers.get('content-length')) > 100000) return json({}, 413);

  if (path === '/api/config')
    return json({
      assistant: Boolean(env.ASSISTANT),
      youtube: Boolean(env.YOUTUBE_KEY),
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, ...(env.TURN ? [env.TURN] : [])],
    });
  if (path === '/api/chat') return post ? chat(req, env) : json({}, 405);
  if (path === '/api/youtube') return post ? json({}, 405) : youtubeSearch(req, env);
  if (path === '/api/calls' || path.startsWith('/api/calls/'))
    return calls(req, env, path.split('/').slice(3).filter(Boolean));
  if (path === '/api/contacts' || path.startsWith('/api/contacts/'))
    return contacts(req, env, path.split('/').slice(3).filter(Boolean));
  const rings = path.match(/^\/api\/devices\/([^/]+)\/rings$/);
  if (rings) return post ? json({}, 405) : deviceRings(env, rings[1]);
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
