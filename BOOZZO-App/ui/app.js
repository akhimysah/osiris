// BOOZZO — l'application de l'œil.
// La peluche reste immobile : tout se passe dans l'écran rond (#eye).
// Le panneau (#panel) sert de télécommande sur téléphone ou ordinateur.

const $ = (selector, root = document) => root.querySelector(selector);
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const store = {
  get(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem('boozzo.' + key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem('boozzo.' + key, JSON.stringify(value));
    } catch {}
  },
};

const svg = (body, filled) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true" fill="${filled ? 'currentColor' : 'none'}" stroke="${filled ? 'none' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const ICON = {
  call: svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
  youtube: svg('<path d="M8 5v14l11-7z"/>', true),
  photo: svg('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
  chat: svg('<path d="M4 5h16v11H9l-5 4z"/>'),
  story: svg('<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M8 8h8"/>'),
  iris: svg('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  home: svg('<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>'),
  music: svg('<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>'),
  clip: svg('<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10.5 9v6l4.5-3z"/>'),
  mic: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
};
const APPS = [
  ['call', 'Appels', 'c-call'],
  ['youtube', 'YouTube', 'c-yt'],
  ['photo', 'Photo', 'c-photo'],
  ['chat', 'Assistant', 'c-chat'],
  ['story', 'Histoires', 'c-story'],
  ['iris', 'Iris', 'c-iris'],
];
// Applications officielles : BOOZZO ne les intègre pas, il les ouvre. Sur un appareil Android,
// le lien lance l'application installée ; ailleurs, il ouvre son site dans un nouvel onglet.
const EXTERNAL = [
  ['whatsapp', 'WhatsApp', 'c-wa', 'chat', 'https://wa.me/'],
  ['spotify', 'Spotify', 'c-spotify', 'music', 'https://open.spotify.com/'],
  ['tiktok', 'TikTok', 'c-tiktok', 'clip', 'https://www.tiktok.com/'],
];
const externalTile = ([, label, color, icon, url], cls = '') =>
  `<a class="${cls}" href="${url}" target="_blank" rel="noopener"><i class="${color}">${ICON[icon]}</i>${label}</a>`;
// Couleur du bouton et rotation de teinte appliquée à l'image de l'iris.
const COLORS = { Azur: ['#4aa3df', 30], Émeraude: ['#4fb58a', -25], Ambre: ['#d39a45', 220], Violet: ['#9a7be0', 95] };

const params = new URLSearchParams(location.search);
const guestCallId = params.get('appel'); // page d'un proche invité à un appel ponctuel
const contactId = params.get('proche'); // page permanente d'un proche
const guestMode = Boolean(guestCallId || contactId);
const kiosk = params.has('oeil');
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Identifiant de cet appareil BOOZZO : ses proches lui sont rattachés.
const deviceId = store.get('device') || (store.set('device', crypto.randomUUID()), store.get('device'));

const eye = $('#eye');
const screen = $('#screen');
const panel = $('#panel');
const stage = $('#stage');

const state = {
  screen: 'home', // home | menu | call | youtube | photo | chat | iris
  color: COLORS[store.get('color')] ? store.get('color') : 'Azur',
  assistant: false,
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  talk: [], // conversation avec l'assistant : { role, content }
  camera: null,
  shot: '',
  wake: false,
  incoming: null, // appel entrant : { contact, name, call }
  handled: '', // dernier appel entrant accepté ou refusé
  me: null, // côté proche : sa fiche
  newContact: null, // proche dont on affiche le lien
};

// ---------- Outils d'affichage ----------

function toast(message) {
  $('#toast').textContent = message;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => ($('#toast').textContent = ''), 4500);
}
function sayInEye(text, label = '') {
  screen.innerHTML = `<div class="say"><span>${label ? `<small>${esc(label)}</small>` : ''}${esc(text)}</span></div>`;
}
function applyColor() {
  $('#iris').style.filter = `hue-rotate(${COLORS[state.color][1]}deg) saturate(1.25)`;
}
function setView(eyeView) {
  stage.classList.toggle('eyeView', eyeView || kiosk);
  $('#viewToggle').textContent = stage.classList.contains('eyeView') ? 'Vue peluche' : 'Agrandir l’œil';
}
async function api(path, body) {
  const response = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.error || 'service_indisponible'), { status: response.status });
  return data;
}
function qrSvg(text) {
  const qr = new QR(-1, 1);
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  let path = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) path += `M${c + 2} ${r + 2}h1v1h-1z`;
  return `<svg class="qr" viewBox="0 0 ${n + 4} ${n + 4}" shape-rendering="crispEdges" role="img" aria-label="QR code de l’appel"><rect width="100%" height="100%" fill="#fff"/><path fill="#000" d="${path}"/></svg>`;
}
const backButton = '<button class="back" data-go="home" type="button">‹ Accueil BOOZZO</button>';

// ---------- Navigation ----------

function stopCamera() {
  state.camera?.getTracks().forEach((track) => track.stop());
  state.camera = null;
}
// Ouvre un écran de l'œil. Quitte proprement l'activité en cours.
function go(name, options = {}) {
  if (state.incoming && name !== 'call') declineIncoming();
  if (state.screen === 'call' && name !== 'call') endCall(true, false);
  stopCamera();
  stopSpeaking();
  if (name === 'story') {
    state.screen = 'chat';
    renderChat();
    return ask('Raconte-moi une courte histoire douce.');
  }
  state.screen = name;
  screen.replaceChildren();
  ({ home: openHome, menu: openMenu, call: openCall, youtube: openYoutube, photo: openPhoto, chat: openChat, iris: openIris })[name](options);
}

function openHome() {
  renderHome();
}
function openMenu() {
  const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  screen.innerHTML = `<div class="menu"><div class="clock">${time}</div><div class="grid">${APPS.map(
    ([id, label, color]) => `<button class="app" data-go="${id}" type="button"><i class="${color}">${ICON[id]}</i>${label}</button>`,
  ).join('')}${EXTERNAL.map((app) => externalTile(app, 'app')).join('')}</div><div class="dock"><button data-go="home" type="button" aria-label="Revenir à l’iris">${ICON.home}</button><button data-listen type="button" aria-label="Parler à BOOZZO">${ICON.mic}</button></div></div>`;
  renderHome();
}
function renderHome() {
  panel.innerHTML = `<h2>Bonjour, je suis BOOZZO</h2>
    <p class="muted">Touchez mon œil ou choisissez une application. Vous pouvez aussi me parler.</p>
    <div class="apps">${APPS.map(([id, label, color]) => `<button data-go="${id}" type="button"><i class="${color}">${ICON[id]}</i>${label}</button>`).join('')}${EXTERNAL.map((app) => externalTile(app)).join('')}</div>
    <div class="row"><button class="btn" data-listen type="button">${ICON.mic}Parler à BOOZZO</button></div>
    ${
      SpeechRecognition
        ? `<label class="check"><input type="checkbox" id="wake" ${state.wake ? 'checked' : ''}> Écouter en continu le mot « BOOZZO »</label>
           <p class="muted">Exemples : « BOOZZO, mets YouTube », « BOOZZO, appelle », « BOOZZO, raconte une histoire ».</p>`
        : '<p class="muted">La reconnaissance vocale n’est pas disponible dans ce navigateur. Utilisez Chrome ou Safari, ou écrivez à l’assistant.</p>'
    }`;
}

// Une commande vocale ne peut pas ouvrir une autre application toute seule : on affiche un lien à toucher.
function offerExternal([, label, , , url]) {
  screen.innerHTML = `<div class="say"><a class="open" href="${url}" target="_blank" rel="noopener"><small>Touchez pour ouvrir</small>${label}</a></div>`;
}

// ---------- Iris ----------

function openIris() {
  panel.innerHTML = `${backButton}<h2>Couleur de l’iris</h2><p class="muted">Choisissez la teinte de l’œil.</p>
    <div class="colors">${Object.entries(COLORS)
      .map(([name, [hex]]) => `<button type="button" data-color="${name}" class="${name === state.color ? 'sel' : ''}" style="background:${hex}" aria-label="${name}" title="${name}"></button>`)
      .join('')}</div><p id="colorName">${state.color}</p>`;
}
function setColor(name) {
  state.color = name;
  store.set('color', name);
  applyColor();
  if (state.screen === 'iris') openIris();
}

// ---------- YouTube ----------

function youtubeId(link) {
  try {
    const url = new URL(link.trim());
    const host = url.hostname.toLowerCase().replace(/^(www\.|m\.|music\.)/, '');
    const id =
      host === 'youtu.be'
        ? url.pathname.slice(1)
        : host === 'youtube.com' || host === 'youtube-nocookie.com'
          ? url.searchParams.get('v') || url.pathname.match(/\/(?:shorts|embed|live)\/([\w-]+)/)?.[1]
          : '';
    return /^[\w-]{11}$/.test(id || '') ? id : '';
  } catch {
    return '';
  }
}
function playYoutube(id) {
  screen.innerHTML = `<iframe title="YouTube" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0"></iframe>`;
}
function openYoutube({ spoken = '' } = {}) {
  const favorites = store.get('videos', []);
  panel.innerHTML = `${backButton}<h2>YouTube dans l’œil</h2>
    <p class="muted">Collez le lien d’une vidéo. Donnez-lui un nom pour la retrouver et la lancer à la voix.</p>
    <form class="stack" id="videoForm"><input name="link" type="url" required placeholder="https://youtu.be/…" aria-label="Lien de la vidéo"><input name="name" maxlength="40" placeholder="Nom du favori (facultatif)" aria-label="Nom du favori"><button class="btn">Lire dans l’œil</button></form>
    <p class="error" id="videoError"></p>
    ${favorites.length ? `<ul class="favs">${favorites.map((v, i) => `<li><button class="btn light" type="button" data-video="${esc(v.id)}">${ICON.youtube}${esc(v.name)}</button><button class="x" type="button" data-unfav="${i}" aria-label="Retirer ${esc(v.name)}">×</button></li>`).join('')}</ul>` : ''}`;
  if (!spoken) return;
  const text = spoken.toLowerCase();
  const match = favorites.find((v) => text.includes(v.name.toLowerCase())) || favorites[0];
  if (match) playYoutube(match.id);
  else sayInEye('Ajoutez une vidéo favorite pour la lancer à la voix.', 'YouTube');
}

// ---------- Photo ----------

async function camera(constraints) {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('indisponible');
  return navigator.mediaDevices.getUserMedia(constraints);
}
function cameraError(error) {
  return error?.name === 'NotAllowedError'
    ? 'Autorisez la caméra et le micro dans le navigateur, puis réessayez.'
    : 'Caméra indisponible sur cet appareil.';
}
async function openPhoto() {
  renderPhoto();
  try {
    state.camera = await camera({ video: { facingMode: 'user' }, audio: false });
    if (state.screen !== 'photo') return stopCamera();
    screen.innerHTML = '<video class="mirror" autoplay playsinline muted></video>';
    $('video', screen).srcObject = state.camera;
    renderPhoto();
  } catch (error) {
    sayInEye(cameraError(error), 'Photo');
  }
}
function renderPhoto() {
  const shots = store.get('shots', []);
  panel.innerHTML = `${backButton}<h2>Photo</h2>
    <div class="row">
      ${state.camera ? `<button class="btn" id="snap" type="button">${ICON.photo}Prendre la photo</button>` : `<button class="btn" data-go="photo" type="button">${ICON.photo}Nouvelle photo</button>`}
      ${state.shot ? '<a class="btn light" id="save" download="boozzo-photo.jpg">Enregistrer</a>' : ''}
    </div>
    ${shots.length ? `<p class="muted">Dernières photos</p><div class="shots">${shots.map((s, i) => `<button type="button" data-shot="${i}" aria-label="Photo ${i + 1}"><img alt="" src="${s}"></button>`).join('')}</div>` : '<p class="muted">Les photos restent sur cet appareil.</p>'}`;
  if (state.shot) $('#save').href = state.shot;
}
async function snap() {
  const video = $('video', screen);
  if (!video) return;
  // La caméra vient peut-être de s'ouvrir : attendre la première image.
  if (!video.videoWidth) await new Promise((resolve) => ((video.onloadeddata = resolve), setTimeout(resolve, 2000)));
  if (!video.videoWidth) return toast('La caméra n’est pas encore prête.');
  const side = Math.min(video.videoWidth, video.videoHeight);
  const canvas = Object.assign(document.createElement('canvas'), { width: 640, height: 640 });
  canvas
    .getContext('2d')
    .drawImage(video, (video.videoWidth - side) / 2, (video.videoHeight - side) / 2, side, side, 0, 0, 640, 640);
  showShot(canvas.toDataURL('image/jpeg', 0.82));
  store.set('shots', [state.shot, ...store.get('shots', [])].slice(0, 8));
  renderPhoto();
}
function showShot(dataUrl) {
  stopCamera();
  state.shot = dataUrl;
  screen.innerHTML = `<img alt="Photo prise par BOOZZO" src="${dataUrl}">`;
}

// ---------- Voix : parole de BOOZZO ----------

let speechRun = 0;
function stopSpeaking() {
  speechRun++;
  window.speechSynthesis?.cancel();
  eye.classList.remove('listening', 'thinking');
}
function frenchVoice() {
  const voices = window.speechSynthesis?.getVoices() || [];
  return voices.find((v) => /^fr/i.test(v.lang) && /am[ée]lie|audrey|aurelie|google/i.test(v.name)) || voices.find((v) => /^fr/i.test(v.lang));
}
// Lit le texte phrase par phrase et affiche la phrase en cours dans l'œil.
async function speak(text, label = 'BOOZZO') {
  stopSpeaking();
  const run = speechRun;
  const sentences = text.match(/[^.!?…]+[.!?…]*\s*/g)?.map((s) => s.trim()).filter(Boolean) || [text];
  for (const sentence of sentences) {
    if (run !== speechRun) return;
    sayInEye(sentence, label);
    await new Promise((resolve) => {
      const fallback = setTimeout(resolve, 1200 + sentence.length * 70);
      if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = 'fr-FR';
      utterance.voice = frenchVoice() || null;
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.onend = utterance.onerror = () => (clearTimeout(fallback), resolve());
      window.speechSynthesis.speak(utterance);
    });
  }
  if (run === speechRun && state.wake) startWake();
}

// ---------- Assistant ----------

function openChat() {
  renderChat();
  sayInEye(state.assistant ? 'Je t’écoute.' : 'L’assistant n’est pas encore branché.', 'Assistant');
}
function renderChat() {
  panel.innerHTML = `${backButton}<h2>Assistant</h2>
    ${state.assistant ? '' : '<p class="error">L’assistant n’est pas encore branché sur ce serveur : il manque la clé d’API (voir README).</p>'}
    <div class="talk" id="talk">${state.talk.map((m) => `<div class="${m.role}">${esc(m.content)}</div>`).join('')}</div>
    <div class="row"><button class="btn" data-listen type="button">${ICON.mic}Parler</button><button class="btn light" id="quiet" type="button">Silence</button></div>
    <form class="line" id="chatForm"><input name="text" maxlength="500" required placeholder="Ou écrivez ici…" aria-label="Message pour BOOZZO" autocomplete="off"><button class="btn">Envoyer</button></form>`;
  const talk = $('#talk');
  talk.scrollTop = talk.scrollHeight;
}
const CHAT_ERRORS = {
  assistant_non_configure: 'L’assistant n’est pas encore branché.',
  cle_invalide: 'La clé de l’assistant est refusée.',
  trop_de_demandes: 'Trop de demandes pour l’instant. Réessayez dans une minute.',
};
async function ask(text) {
  if (state.screen !== 'chat') {
    state.screen = 'chat';
    screen.replaceChildren();
  }
  state.talk.push({ role: 'user', content: text });
  renderChat();
  stopSpeaking();
  const run = speechRun;
  eye.classList.add('thinking');
  sayInEye('…', 'Je réfléchis');
  try {
    const { reply } = await api('/api/chat', { messages: state.talk.slice(-12).filter((m, i, list) => i > 0 || m.role === 'user') });
    state.talk.push({ role: 'assistant', content: reply });
    if (state.screen !== 'chat' || run !== speechRun) return;
    renderChat();
    speak(reply);
  } catch (error) {
    state.talk.pop();
    if (state.screen !== 'chat') return;
    eye.classList.remove('thinking');
    renderChat();
    sayInEye(CHAT_ERRORS[error.message] || 'Je n’arrive pas à répondre pour l’instant.', 'Assistant');
  }
}

// ---------- Voix : écoute et commandes ----------

const VOICE_COLORS = [[/azur|bleu/, 'Azur'], [/[ée]meraude|vert/, 'Émeraude'], [/ambre|orange|dor[ée]/, 'Ambre'], [/violet|mauve/, 'Violet']];
// Exécute une commande reconnue. Renvoie false si la phrase n'en est pas une.
function command(spoken) {
  const text = spoken.toLowerCase();
  const color = VOICE_COLORS.find(([pattern]) => pattern.test(text));
  if (/raccroch|termine l.appel/.test(text)) return state.screen === 'call' ? (endCall(), true) : false;
  if (state.screen === 'photo' && state.camera && /prend|clic|ouistiti|cheese/.test(text)) return snap(), true;
  if (/you ?tube|vid[ée]o/.test(text)) return go('youtube', { spoken }), true;
  if (state.incoming && /r[ée]pond|d[ée]croch|accepte/.test(text)) return acceptIncoming(), true;
  if (state.incoming && /refuse|non merci/.test(text)) return declineIncoming(), true;
  const external = EXTERNAL.find(([id]) => text.replace(/\s/g, '').includes(id));
  if (external) return go('home'), offerExternal(external), true;
  if (/appel|t[ée]l[ée]phone/.test(text)) return go('call', { spoken }), true;
  if (/photo|cam[ée]ra/.test(text)) return go('photo'), true;
  if (/histoire|conte\b/.test(text)) return go('story'), true;
  if (/assistant/.test(text)) return go('chat'), true;
  if (color) return go('home'), setColor(color[1]), true;
  if (/\b(iris|œil|oeil)\b|accueil|ferme|arr[êe]te|stop/.test(text)) return go('home'), true;
  if (/menu|applications?/.test(text)) return setView(true), go('menu'), true;
  return false;
}
function heard(spoken) {
  const text = spoken.trim();
  if (!text) return;
  if (command(text)) return toast('Compris · ' + text);
  ask(text);
}

let recognizer = null;
function stopRecognizer() {
  const current = recognizer;
  recognizer = null;
  current?.abort();
  eye.classList.remove('listening');
  document.body.classList.remove('hearing');
}
// Écoute une seule phrase (bouton micro).
function listen() {
  if (!SpeechRecognition) return toast('Reconnaissance vocale indisponible dans ce navigateur.');
  stopSpeaking();
  stopRecognizer();
  const r = (recognizer = new SpeechRecognition());
  r.lang = 'fr-FR';
  eye.classList.add('listening');
  document.body.classList.add('hearing');
  r.onresult = (event) => heard(event.results[0][0].transcript);
  r.onerror = (event) => {
    if (event.error === 'not-allowed') toast('Autorisez le micro dans le navigateur.');
    else if (event.error !== 'aborted' && event.error !== 'no-speech') toast('Écoute interrompue.');
  };
  r.onend = () => {
    if (recognizer !== r) return;
    recognizer = null;
    eye.classList.remove('listening');
    document.body.classList.remove('hearing');
    if (state.wake) startWake();
  };
  try {
    r.start();
  } catch {
    stopRecognizer();
  }
}
// Écoute continue : n'agit que si la phrase contient « BOOZZO » (ou ce que le navigateur en transcrit).
const WAKE = /\b(bo+u?[zs]{1,2}[oa]u?t?|bou[zs]+ou|bo[zs]o|bouz+eau)\b[\s,.!?]*/i;
function startWake() {
  if (!SpeechRecognition || !state.wake || recognizer) return;
  const r = (recognizer = new SpeechRecognition());
  r.lang = 'fr-FR';
  r.continuous = true;
  r.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    if (!result.isFinal) return;
    const text = result[0].transcript;
    const found = text.match(WAKE);
    if (!found) return;
    const rest = text.slice(found.index + found[0].length).trim();
    stopRecognizer();
    if (rest) heard(rest);
    else listen();
    if (!recognizer && !window.speechSynthesis?.speaking) startWake();
  };
  r.onerror = (event) => {
    if (event.error === 'not-allowed') {
      state.wake = false;
      toast('Autorisez le micro pour l’écoute continue.');
      if (state.screen === 'home' || state.screen === 'menu') renderHome();
    }
  };
  r.onend = () => {
    if (recognizer !== r) return;
    recognizer = null;
    if (state.wake) setTimeout(startWake, 400);
  };
  try {
    r.start();
  } catch {
    recognizer = null;
  }
}

// ---------- Appels vidéo dans l'œil (WebRTC entre deux appareils) ----------
// Signalisation : celui qui ouvre l'appel écrit avec le rôle 'eye', celui qui le rejoint avec 'guest'.
// BOOZZO ouvre l'appel quand il appelle ; le proche l'ouvre quand c'est lui qui appelle BOOZZO.

const call = { id: '', role: '', pc: null, local: null, cursor: '', timer: 0, muted: false, status: '', connected: false, busy: false, ring: '', name: '', polls: 0 };
const callLink = () => `${location.origin}/?appel=${call.id}`;
const contactLink = (id) => `${location.origin}/?proche=${id}`;
const contacts = () => store.get('contacts', []);
const peerLabel = () => call.name || (guestMode ? 'BOOZZO' : 'ton proche');

function openCall({ start = false, spoken = '' } = {}) {
  renderCall();
  if (guestMode || state.incoming) return;
  const text = spoken.toLowerCase();
  const named = text && contacts().find((c) => text.includes(c.name.toLowerCase()));
  if (named) return startCall('eye', { contact: named });
  if (start || (spoken && !contacts().length)) return startCall('eye');
  if (spoken) sayInEye('Qui veux-tu appeler ?', 'Appels');
}
function renderCall() {
  const active = Boolean(call.role);
  const busy = call.busy ? 'disabled' : '';
  let body;
  if (active) {
    const invite =
      !guestMode && !call.ring && call.role === 'eye' && !call.connected
        ? `${qrSvg(callLink())}<p class="muted">Votre proche scanne ce code avec son téléphone, ou ouvre le lien.</p>
           <div class="row"><button class="btn light" data-share="${esc(callLink())}" type="button">Envoyer le lien</button></div>`
        : '';
    body = `<p><strong>${esc(call.status)}</strong></p>
      <div class="row"><video class="self" id="self" autoplay playsinline muted></video></div>
      <div class="row"><button class="btn danger" id="hangup" type="button">Raccrocher</button><button class="btn light" id="mute" type="button">${call.muted ? 'Réactiver le micro' : 'Couper le micro'}</button></div>
      ${invite}
      <details><summary>Si l’appel ne se connecte pas</summary><p class="muted">Vérifiez que les deux appareils ont autorisé la caméra et le micro. Sur certains réseaux (4G, Wi-Fi d’entreprise), un serveur relais doit être ajouté au projet.</p></details>`;
  } else if (state.incoming) {
    body = `<p><strong>${esc(state.incoming.name)} vous appelle…</strong></p>
      <div class="row"><button class="btn" data-call="accept" type="button" ${busy}>${ICON.call}Répondre</button><button class="btn danger" data-call="decline" type="button">Refuser</button></div>`;
  } else if (contactId) {
    body = state.me
      ? `<p>${esc(call.status || `Bonjour ${state.me.name} ! Vous êtes relié à la peluche BOOZZO.`)}</p>
         <div class="row"><button class="btn" id="callBoozzo" type="button" ${busy}>${ICON.call}Appeler BOOZZO</button></div>
         <p class="muted">Gardez cette page ouverte pour recevoir les appels de BOOZZO. Ajoutez-la à l’écran d’accueil de votre téléphone pour la retrouver.</p>`
      : `<p>${esc(call.status || 'Connexion à BOOZZO…')}</p>`;
  } else if (guestCallId) {
    body = `<p>${esc(call.status || 'Un proche vous appelle depuis sa peluche BOOZZO.')}</p>
      <div class="row"><button class="btn" id="answer" type="button" ${busy}>${ICON.call}Répondre</button></div>
      <p class="muted">Votre caméra et votre micro seront partagés avec votre proche pendant l’appel.</p>`;
  } else {
    const list = contacts();
    const fresh = state.newContact;
    body = `<p>${esc(call.status || 'Appelez un proche : son visage apparaît dans l’œil de BOOZZO.')}</p>
      ${list.length ? `<ul class="favs">${list.map((c) => `<li><button class="btn" type="button" data-contact="${c.id}" ${busy}>${ICON.call}${esc(c.name)}</button>${c.phone ? `<a class="btn light wa" href="https://wa.me/${c.phone}" target="_blank" rel="noopener">WhatsApp</a>` : ''}<button class="x" type="button" data-link="${c.id}" aria-label="Lien de ${esc(c.name)}" title="Afficher le lien">QR</button><button class="x" type="button" data-forget="${c.id}" aria-label="Retirer ${esc(c.name)}">×</button></li>`).join('')}</ul>` : ''}
      ${
        fresh
          ? `<div class="invite"><p><strong>Lien de ${esc(fresh.name)}</strong></p>${qrSvg(contactLink(fresh.id))}
             <p class="muted">À ouvrir une seule fois sur le téléphone de ${esc(fresh.name)}, qui garde la page. Ensuite, dites « BOOZZO, appelle ${esc(fresh.name)} ».</p>
             <div class="row"><button class="btn light" data-share="${esc(contactLink(fresh.id))}" type="button">Envoyer le lien</button></div></div>`
          : ''
      }
      <form class="stack" id="contactForm"><input name="name" maxlength="30" required placeholder="Prénom du proche (ex. Mamie)" aria-label="Prénom du proche" autocomplete="off"><input name="phone" type="tel" maxlength="20" placeholder="Numéro WhatsApp, facultatif (ex. +33 6 12 34 56 78)" aria-label="Numéro WhatsApp, facultatif" autocomplete="off"><button class="btn light">Ajouter ce proche</button></form>
      <div class="row"><button class="btn light" id="startCall" type="button" ${busy}>Appel ponctuel par QR code</button></div>`;
  }
  panel.innerHTML = `${guestMode ? '' : backButton}<h2>Appel dans l’œil</h2>${body}`;
  if ($('#self') && call.local) $('#self').srcObject = call.local;
}
function setCallStatus(status) {
  call.status = status;
  if (state.screen === 'call') renderCall();
}
function showLocalInEye(badge) {
  screen.innerHTML = `<video class="mirror" autoplay playsinline muted></video><span class="badge">${esc(badge)}</span>`;
  $('video', screen).srcObject = call.local;
}
const signal = (type, sdp) => api(`/api/calls/${call.id}/signal`, { from: call.role, type, sdp });
const setRing = (contact, callId, from) =>
  fetch(`/api/contacts/${contact}/ring`, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ call: callId, from }),
  }).catch(() => {});

// role 'eye' : ouvrir un appel (et faire sonner `contact` s'il est donné). role 'guest' : rejoindre `callId`.
async function startCall(role, { callId = '', contact = null } = {}) {
  if (call.role || call.busy) return;
  if (state.screen !== 'call') {
    state.screen = 'call';
    screen.replaceChildren();
  }
  call.busy = true;
  call.name = contact?.name || '';
  setCallStatus('Ouverture de la caméra…');
  try {
    call.local = await camera({ video: { facingMode: 'user' }, audio: true });
  } catch (error) {
    call.busy = false;
    sayInEye(cameraError(error), 'Appel');
    return setCallStatus(cameraError(error));
  }
  try {
    if (role === 'eye') {
      call.id = (await api('/api/calls', {})).id;
      call.cursor = '';
    } else {
      call.id = callId;
      // Ignore les anciens messages si la page a été rechargée.
      call.cursor = (await api(`/api/calls/${call.id}/signal?for=guest`)).cursor;
    }
    Object.assign(call, { role, busy: false, connected: false, muted: false, polls: 0, ring: '' });
    if (role === 'guest') await signal('join');
    else if (contact) {
      call.ring = contact.id;
      await setRing(contact.id, call.id, guestMode ? 'guest' : 'eye');
    }
  } catch (error) {
    call.local.getTracks().forEach((track) => track.stop());
    Object.assign(call, { local: null, busy: false, id: '', role: '' });
    return setCallStatus(error.status === 404 ? 'Cet appel est terminé ou le lien a expiré.' : 'Impossible d’ouvrir l’appel. Réessayez.');
  }
  const waiting = role === 'guest' ? 'Connexion…' : call.ring ? `Appel de ${peerLabel()}…` : 'En attente de ton proche';
  if (role === 'eye' && kiosk && !call.ring) screen.innerHTML = qrSvg(callLink());
  else showLocalInEye(waiting);
  setCallStatus(role === 'guest' ? 'Connexion…' : call.ring ? `Appel de ${peerLabel()}… ça sonne.` : 'Appel ouvert. En attente de votre proche…');
  call.timer = setInterval(pollCall, 1000);
}
let polling = false;
async function pollCall() {
  if (polling || !call.role) return;
  polling = true;
  try {
    const { messages, cursor } = await api(`/api/calls/${call.id}/signal?for=${call.role}&after=${encodeURIComponent(call.cursor)}`);
    call.cursor = cursor;
    for (const message of messages) await onSignal(message);
    // Tant que ça sonne : s'arrêter si le proche refuse ou ne répond pas.
    if (call.ring && !call.pc && ++call.polls % 3 === 0) {
      const contact = await api(`/api/contacts/${call.ring}`);
      if (contact.ring?.call !== call.id) {
        const name = peerLabel();
        endCall(false);
        setCallStatus(`${name} n’a pas répondu.`);
      }
    }
  } catch (error) {
    if (error.status === 404) endCall(false);
  } finally {
    polling = false;
  }
}
function newPeer() {
  call.pc?.close();
  const pc = (call.pc = new RTCPeerConnection({ iceServers: state.iceServers }));
  call.local.getTracks().forEach((track) => pc.addTrack(track, call.local));
  pc.ontrack = (event) => {
    if (pc !== call.pc || $('video.remote', screen)) return;
    screen.innerHTML = '<video class="remote" autoplay playsinline></video>';
    const video = $('video', screen);
    video.srcObject = event.streams[0];
    video.play().catch(() => toast('Touchez l’œil pour activer le son.'));
    call.connected = true;
    setCallStatus('En appel');
  };
  pc.onconnectionstatechange = () => {
    if (pc !== call.pc) return;
    if (pc.connectionState === 'failed') setCallStatus('La connexion a échoué. Raccrochez et réessayez.');
    if (pc.connectionState === 'disconnected') setCallStatus('Connexion instable…');
    if (pc.connectionState === 'connected') setCallStatus('En appel');
  };
  return pc;
}
// Attend la fin de la collecte des adresses réseau pour envoyer une description complète.
function iceComplete(pc) {
  if (pc.iceGatheringState === 'complete') return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => (pc.removeEventListener('icegatheringstatechange', check), clearTimeout(timer), resolve());
    const check = () => pc.iceGatheringState === 'complete' && done();
    const timer = setTimeout(done, 4000);
    pc.addEventListener('icegatheringstatechange', check);
  });
}
async function onSignal({ type, sdp }) {
  if (type === 'bye') {
    endCall(false);
    return toast('L’appel est terminé.');
  }
  if (call.role === 'eye' && type === 'join') {
    setCallStatus('Connexion…');
    const pc = newPeer();
    await pc.setLocalDescription(await pc.createOffer());
    await iceComplete(pc);
    await signal('offer', pc.localDescription.sdp);
  } else if (call.role === 'guest' && type === 'offer') {
    const pc = newPeer();
    await pc.setRemoteDescription({ type: 'offer', sdp });
    await pc.setLocalDescription(await pc.createAnswer());
    await iceComplete(pc);
    await signal('answer', pc.localDescription.sdp);
  } else if (call.role === 'eye' && type === 'answer' && call.pc?.signalingState === 'have-local-offer') {
    await call.pc.setRemoteDescription({ type: 'answer', sdp });
  }
}
function endCall(sendBye = true, show = true) {
  if (!call.role) return;
  clearInterval(call.timer);
  if (sendBye)
    fetch(`/api/calls/${call.id}/signal`, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: call.role, type: 'bye' }),
    }).catch(() => {});
  if (call.ring) setRing(call.ring, null);
  call.pc?.close();
  call.local?.getTracks().forEach((track) => track.stop());
  Object.assign(call, { id: '', role: '', pc: null, local: null, cursor: '', connected: false, muted: false, ring: '', name: '', status: 'Appel terminé.' });
  screen.replaceChildren();
  if (show && state.screen === 'call') renderCall();
}

// ---------- Proches et appels entrants ----------

// Le numéro WhatsApp reste sur cet appareil : il n'est pas envoyé au serveur.
async function addContact(name, phone = '') {
  try {
    const contact = await api('/api/contacts', { device: deviceId, name });
    store.set('contacts', [...contacts(), { id: contact.id, name: contact.name, phone }]);
    state.newContact = contact;
  } catch {
    toast('Impossible d’ajouter ce proche pour l’instant.');
  }
  renderCall();
}
function forgetContact(id) {
  store.set('contacts', contacts().filter((c) => c.id !== id));
  if (state.newContact?.id === id) state.newContact = null;
  api(`/api/contacts/${id}/remove`, { device: deviceId }).catch(() => {});
  renderCall();
}

let ringer = null;
function ringStart() {
  ringStop();
  try {
    const context = new AudioContext();
    const note = (frequency, at) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, context.currentTime + at);
      gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + at + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + at + 0.45);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(context.currentTime + at);
      oscillator.stop(context.currentTime + at + 0.5);
    };
    const melody = () => (note(659, 0), note(784, 0.25), note(988, 0.5));
    ringer = { context, timer: setInterval(melody, 1800) };
    melody();
  } catch {}
}
function ringStop() {
  if (!ringer) return;
  clearInterval(ringer.timer);
  ringer.context.close().catch(() => {});
  ringer = null;
}
function showIncoming(incoming) {
  state.incoming = incoming;
  stopCamera();
  stopSpeaking();
  state.screen = 'call';
  screen.innerHTML = `<div class="say ring"><span><small>Appel</small>${esc(incoming.name)}</span>
    <div class="answer"><button class="yes" data-call="accept" type="button" aria-label="Répondre">${ICON.call}</button><button class="no" data-call="decline" type="button" aria-label="Refuser">${ICON.call}</button></div></div>`;
  renderCall();
  ringStart();
}
function clearIncoming() {
  if (!state.incoming) return;
  state.incoming = null;
  ringStop();
  screen.replaceChildren();
  if (state.screen === 'call') renderCall();
}
function acceptIncoming() {
  const incoming = state.incoming;
  if (!incoming) return;
  state.handled = incoming.call;
  clearIncoming();
  startCall('guest', { callId: incoming.call, contact: { name: incoming.name } });
}
function declineIncoming() {
  const incoming = state.incoming;
  if (!incoming) return;
  state.handled = incoming.call;
  setRing(incoming.contact, null);
  clearIncoming();
  call.status = 'Appel refusé.';
  renderCall();
}
// Surveille les appels entrants : ceux des proches côté BOOZZO, ceux de BOOZZO côté proche.
async function watchRings() {
  if (call.role || call.busy) return;
  try {
    let incoming = null;
    if (contactId) {
      const me = await api(`/api/contacts/${contactId}`);
      const first = !state.me;
      state.me = me;
      if (me.ring?.from === 'eye') incoming = { contact: me.id, name: 'BOOZZO', call: me.ring.call };
      if (first && !incoming) renderCall();
    } else if (contacts().length) {
      incoming = (await api(`/api/devices/${deviceId}/rings`)).rings[0] || null;
    }
    if (incoming && incoming.call !== state.handled && incoming.call !== state.incoming?.call) showIncoming(incoming);
    if (!incoming && state.incoming) clearIncoming();
  } catch (error) {
    if (contactId && error.status === 404) {
      call.status = 'Ce lien n’est plus valable. Demandez-en un nouveau.';
      renderCall();
    }
  }
}

// ---------- Événements ----------

document.addEventListener('click', (event) => {
  const button = event.target.closest('button, a');
  const data = button?.dataset || {};
  // Sur l'écran rond (sans panneau), l'icône Appels ouvre directement l'appel.
  if (data.go) return go(data.go, data.go === 'call' ? { start: kiosk } : undefined);
  if ('listen' in data) return listen();
  if (data.color) return setColor(data.color);
  if (data.call) return data.call === 'accept' ? acceptIncoming() : declineIncoming();
  if (data.contact) return startCall('eye', { contact: contacts().find((c) => c.id === data.contact) });
  if (data.link) return (state.newContact = contacts().find((c) => c.id === data.link)), renderCall();
  if (data.forget) return forgetContact(data.forget);
  if (data.share) {
    if (navigator.share) return navigator.share({ title: 'BOOZZO', url: data.share }).catch(() => {});
    return navigator.clipboard?.writeText(data.share).then(
      () => toast('Lien copié.'),
      () => toast(data.share),
    );
  }
  if (data.video) return playYoutube(data.video);
  if (data.unfav) {
    store.set('videos', store.get('videos', []).filter((_, i) => i !== Number(data.unfav)));
    return openYoutube();
  }
  if (data.shot) return showShot(store.get('shots', [])[Number(data.shot)]), renderPhoto();
  switch (button?.id) {
    case 'viewToggle':
      return setView(!stage.classList.contains('eyeView'));
    case 'snap':
      return snap();
    case 'quiet':
      return stopSpeaking();
    case 'startCall':
      return startCall('eye');
    case 'answer':
      return startCall('guest', { callId: guestCallId });
    case 'hangup':
      return endCall();
    case 'mute':
      call.muted = !call.muted;
      call.local?.getAudioTracks().forEach((track) => (track.enabled = !call.muted));
      return renderCall();
    case 'callBoozzo':
      return startCall('eye', { contact: { id: contactId, name: 'BOOZZO' } });
  }
  // Sur l'écran rond, toucher l'œil pendant une application ramène au menu.
  if (kiosk && !button && event.target.closest('#eye') && !['home', 'menu'].includes(state.screen)) return go('menu');
  // Toucher l'œil au repos : l'agrandir et ouvrir le menu.
  if (!button && event.target.closest('#eye') && (state.screen === 'home' || state.screen === 'menu')) {
    setView(true);
    go(state.screen === 'menu' ? 'home' : 'menu');
  }
});
document.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  if (form.id === 'chatForm') {
    const text = form.text.value.trim();
    if (text) ask(text);
  }
  if (form.id === 'contactForm') {
    const name = form.name.value.trim();
    if (name) addContact(name, form.phone.value.replace(/\D/g, '').slice(0, 15));
  }
  if (form.id === 'videoForm') {
    const id = youtubeId(form.link.value);
    if (!id) return ($('#videoError').textContent = 'Lien YouTube non reconnu. Collez le lien complet de la vidéo.');
    const name = form.name.value.trim();
    if (name) store.set('videos', [{ id, name }, ...store.get('videos', []).filter((v) => v.id !== id)].slice(0, 12));
    openYoutube();
    playYoutube(id);
  }
});
document.addEventListener('change', (event) => {
  if (event.target.id !== 'wake') return;
  state.wake = event.target.checked;
  if (state.wake) startWake();
  else stopRecognizer();
});
window.addEventListener('pagehide', () => {
  endCall(true, false);
  stopCamera();
});

// ---------- Démarrage ----------

applyColor();
document.body.classList.toggle('kiosk', kiosk);
setView(kiosk);
if (guestMode) {
  state.screen = 'call';
  renderCall();
} else {
  go('home');
}
if (!guestCallId) {
  watchRings();
  setInterval(watchRings, 3000);
}
api('/api/config')
  .then((config) => {
    state.assistant = Boolean(config.assistant);
    if (Array.isArray(config.iceServers)) state.iceServers = config.iceServers;
    if (state.screen === 'chat') renderChat();
  })
  .catch(() => {});
