// BeyaBear’s — l'application de l'œil.
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
  games: svg('<rect x="3" y="8" width="18" height="10" rx="5"/><path d="M8 11v4M6 13h4"/><circle cx="16" cy="13" r="1.3"/>'),
  story: svg('<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M8 8h8"/>'),
  iris: svg('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  home: svg('<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>'),
  music: svg('<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>'),
  tiktok: svg('<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10.5 9v6l4.5-3z"/>'),
  phone: svg('<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>'),
  next: svg('<path d="M9 6l6 6-6 6"/>'),
  face: svg('<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M9 10v1M15 10v1M9 15c1.8 1.4 4.2 1.4 6 0"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
  weather: svg('<circle cx="8" cy="8" r="3"/><path d="M8 2v1M2 8h1M3.8 3.8l.7.7M12.2 3.8l-.7.7"/><path d="M8.5 20h8a3.5 3.5 0 0 0 .6-6.9 5 5 0 0 0-9.5 1.3A2.8 2.8 0 0 0 8.5 20z"/>'),
  torch: svg('<path d="M8 3h8l-1.5 5v12a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V8z"/><path d="M9.5 8h5M12 12v3"/>'),
  esim: svg('<path d="M7 3h7l4 4v14H7z"/><rect x="10" y="11" width="5" height="6" rx="1"/>'),
  mic: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
};
const APPS = [
  ['call', 'Appels', 'c-call'],
  ['youtube', 'YouTube', 'c-yt'],
  ['tiktok', 'TikTok', 'c-tiktok'],
  ['photo', 'Photo', 'c-photo'],
  ['story', 'Histoires', 'c-story'],
  ['chat', 'Assistant', 'c-chat'],
  ['games', 'Jeux', 'c-games'],
  ['clock', 'Heure', 'c-clock'],
  ['weather', 'Météo', 'c-weather'],
  ['torch', 'Torche', 'c-torch'],
  ['face', 'Visages', 'c-face'],
  ['phone', 'Téléphone', 'c-phone'],
  ['iris', 'Iris', 'c-iris'],
  ['esim', 'Forfait', 'c-esim'],
];
// Applications officielles : BeyaBear’s ne les intègre pas, il les ouvre. Sur un appareil Android,
// le lien lance l'application installée ; ailleurs, il ouvre son site dans un nouvel onglet.
const EXTERNAL = [
  // WhatsApp Web gère les appels audio et vidéo depuis 2026 ; sur téléphone, le lien ouvre l'application.
  ['whatsapp', 'WhatsApp', 'c-wa', 'chat', /Android|iPhone|iPad/i.test(navigator.userAgent) ? 'https://wa.me/' : 'https://web.whatsapp.com/'],
  ['spotify', 'Spotify', 'c-spotify', 'music', 'https://open.spotify.com/'],
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

// Identifiant de cet appareil BeyaBear’s : ses proches lui sont rattachés.
const uuid = () =>
  crypto.randomUUID?.() ??
  '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
const deviceId = guestMode ? '' : store.get('device') || (store.set('device', uuid()), store.get('device'));

const eye = $('#eye');
const screen = $('#screen');
const panel = $('#panel');
const stage = $('#stage');

const DEMO_ONLY = 'Démonstration : cette fonction demande la version complète, avec son serveur.';
const state = {
  screen: 'home', // home (iris) | menu | call | youtube | tiktok | photo | chat | iris | phone
  color: COLORS[store.get('color')] ? store.get('color') : 'Azur',
  assistant: false,
  youtube: false, // la recherche YouTube est-elle disponible sur ce serveur ?
  server: true, // faux quand la page est servie seule, sans le serveur BeyaBear’s (démonstration)
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  talk: [], // conversation avec l'assistant : { role, content }
  camera: null,
  shot: '',
  wake: false,
  incoming: null, // appel entrant : { contact, name, call }
  handled: '', // dernier appel entrant accepté ou refusé
  me: null, // côté proche : sa fiche
  newContact: null,
  menuPage: 0, // proche dont on affiche le lien
};

// ---------- Outils d'affichage ----------

function toast(message) {
  $('#toast').textContent = message;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => ($('#toast').textContent = ''), 4500);
}
function sayInEye(text, label = '') {
  screen.innerHTML = `<div class="say${text.length > 90 ? ' long' : ''}${label === 'Histoire' ? ' story' : ''}"><span>${label ? `<small>${esc(label)}</small>` : ''}${esc(text)}</span></div>`;
}
function applyColor() {
  $('#iris').style.filter = `hue-rotate(${COLORS[state.color][1]}deg) saturate(1.25)`;
}
function setView(eyeView) {
  stage.classList.toggle('eyeView', eyeView || kiosk);
  $('#viewToggle').textContent = stage.classList.contains('eyeView') ? 'Vue peluche' : 'Agrandir l’œil';
}
// Ce qui se joue dans l'œil doit se voir : on agrandit l'œil et on le ramène à l'écran.
function focusEye() {
  setView(true);
  if (!kiosk) window.scrollTo({ top: 0, behavior: 'smooth' });
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
const backButton = '<button class="back" data-go="menu" type="button">‹ Accueil BeyaBear’s</button>';

// ---------- Navigation ----------

// Écran courant de l'œil ; le style s'en sert pour le bouton de retour de l'écran rond.
function setScreen(name) {
  state.screen = name;
  document.body.dataset.screen = name;
}
function stopCamera() {
  state.camera?.getTracks().forEach((track) => track.stop());
  state.camera = null;
}
// Ouvre un écran de l'œil. Quitte proprement l'activité en cours.
function go(name, options = {}) {
  // Pendant un appel ou une sonnerie, l'écran d'appel garde la main.
  if (name === 'call' && (call.role || call.busy || state.incoming)) return renderCall();
  if (state.incoming) declineIncoming();
  if (state.screen === 'torch') keepAwake(false);
  $('.flood')?.remove();
  endCall(true, false);
  stopCamera();
  stopSpeaking();
  setScreen(name);
  screen.replaceChildren();
  ({ home: openHome, menu: openMenu, call: openCall, youtube: () => openVideo('youtube', options), tiktok: () => openVideo('tiktok', options), photo: openPhoto, chat: openChat, iris: openIris, story: openStories, clock: openClock, weather: openWeather, torch: openTorch, face: openFaces, phone: openPhone, esim: openEsim, games: openGames })[name](options);
}

function openHome() {
  renderHome();
}
// Le menu de l'œil tient sur deux pages de six grandes tuiles, lisibles sur un petit écran rond.
function openMenu({ page = 0 } = {}) {
  const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const tiles = [
    ...APPS.map(([id, label, color]) => `<button class="app" data-go="${id}" type="button"><i class="${color}">${ICON[id]}</i>${label}</button>`),
    ...EXTERNAL.map((app) => externalTile(app, 'app')),
  ];
  const pages = Math.ceil(tiles.length / 6);
  state.menuPage = ((page % pages) + pages) % pages;
  screen.innerHTML = `<div class="menu"><div class="clock">${time}</div><div class="grid">${tiles.slice(state.menuPage * 6, state.menuPage * 6 + 6).join('')}</div>
    <div class="dock"><button data-go="home" type="button" aria-label="Revenir à l’iris">${ICON.home}</button><button data-listen type="button" aria-label="Parler à BeyaBear’s">${ICON.mic}</button><button data-page type="button" aria-label="Autres applications">${ICON.next}</button></div></div>`;
  renderHome();
}
function renderHome() {
  panel.innerHTML = `<h2>Bonjour, je suis BeyaBear’s</h2>
    <p class="muted">Touchez mon œil ou choisissez une application. Vous pouvez aussi me parler.</p>
    <div class="apps">${APPS.map(([id, label, color]) => `<button data-go="${id}" type="button"><i class="${color}">${ICON[id]}</i>${label}</button>`).join('')}${EXTERNAL.map((app) => externalTile(app)).join('')}</div>
    <div class="row"><button class="btn" data-listen type="button">${ICON.mic}Parler à BeyaBear’s</button></div>
    ${
      SpeechRecognition
        ? `<label class="check"><input type="checkbox" id="wake" ${state.wake ? 'checked' : ''}> Écouter en continu le mot « Beya »</label>
           <p class="muted">Exemples : « Beya, mets YouTube », « Beya, appelle », « Beya, raconte une histoire ».</p>`
        : '<p class="muted">La reconnaissance vocale n’est pas disponible dans ce navigateur. Utilisez Chrome ou Safari, ou écrivez à l’assistant.</p>'
    }`;
}

// Une commande vocale ne peut pas ouvrir une autre application toute seule : on affiche un lien à toucher.
function offerExternal([, label, , , url]) {
  screen.innerHTML = `<div class="say"><a class="open" href="${url}" target="_blank" rel="noopener"><small>Touchez pour ouvrir</small>${label}</a></div>`;
}

// ---------- Téléphone : afficher l'écran du téléphone dans l'œil ----------
// La recopie d'écran est assurée par la carte de la peluche (voir peluche/README.md), pas par cette page :
// quand le téléphone lance la recopie, son écran passe au-dessus de l'œil ; quand il l'arrête, l'œil revient.

function openPhone() {
  sayInEye('Sur le téléphone, lancez la recopie de l’écran vers BeyaBear’s.', 'Téléphone');
  panel.innerHTML = `${backButton}<h2>Mon téléphone dans l’œil</h2>
    <p>Affichez l’écran de votre téléphone dans l’œil de BeyaBear’s pour y retrouver toutes vos applications.</p>
    <p><strong>iPhone</strong><br>Ouvrez le Centre de contrôle, touchez « Recopie de l’écran », puis choisissez « BeyaBear’s ». Pour arrêter, touchez « Arrêter la recopie ».</p>
    <p><strong>Android</strong><br>Reliez le téléphone à la peluche par câble USB, ou en Wi-Fi après l’avoir autorisé une première fois (voir le guide d’installation).</p>
    <p class="muted">La recopie fonctionne uniquement sur la peluche, une fois sa carte installée avec le kit du dossier « peluche ». Le téléphone et la peluche doivent être sur le même Wi-Fi.</p>`;
}

// ---------- Heure : horloge à chiffres rouges dans l'œil ----------

// Segments allumés pour chaque chiffre, dans l'ordre a b c d e f g.
const SEGMENTS = ['1111110', '0110000', '1101101', '1111001', '0110011', '1011011', '1011111', '1110000', '1111111', '1111011'];
const SEGMENT_SHAPES = [
  'x="2" y=".6" width="6" height="1.7"', // a : haut
  'x="7.7" y="1.9" width="1.7" height="6.3"', // b : haut droit
  'x="7.7" y="9.8" width="1.7" height="6.3"', // c : bas droit
  'x="2" y="15.7" width="6" height="1.7"', // d : bas
  'x=".6" y="9.8" width="1.7" height="6.3"', // e : bas gauche
  'x=".6" y="1.9" width="1.7" height="6.3"', // f : haut gauche
  'x="2" y="8.15" width="6" height="1.7"', // g : milieu
];
const ledDigit = (digit, x) =>
  `<g transform="translate(${x} 0)">${SEGMENT_SHAPES.map((shape, i) => `<rect ${shape} rx=".7" class="${SEGMENTS[digit][i] === '1' ? 'on' : 'off'}"/>`).join('')}</g>`;
function ledClock(date = new Date()) {
  const [h1, h2] = String(date.getHours()).padStart(2, '0');
  const [m1, m2] = String(date.getMinutes()).padStart(2, '0');
  return `<div class="led" role="img" aria-label="Il est ${date.getHours()} heures ${date.getMinutes()}"><svg viewBox="0 0 49 18">
    ${ledDigit(h1, 0)}${ledDigit(h2, 11.5)}<g class="colon"><rect x="23.6" y="5" width="1.8" height="1.8" rx=".5" class="on"/><rect x="23.6" y="11.2" width="1.8" height="1.8" rx=".5" class="on"/></g>${ledDigit(m1, 27.5)}${ledDigit(m2, 39)}</svg></div>`;
}
let clockTimer = 0;
function openClock() {
  const show = () => {
    if (state.screen !== 'clock') return clearInterval(clockTimer);
    screen.innerHTML = ledClock();
  };
  clearInterval(clockTimer);
  clockTimer = setInterval(show, 5000);
  show();
  focusEye();
  const now = new Date();
  panel.innerHTML = `${backButton}<h2>Heure</h2>
    <p>Il est ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}, ${now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}.</p>
    <p class="muted">L’heure s’affiche dans l’œil en grands chiffres rouges. Dites « Beya, quelle heure est-il ? » pour l’afficher.</p>`;
}

// ---------- Torche : l'œil éclaire ----------
// L'écran de l'œil passe en blanc (ou en veilleuse orangée). Sur un téléphone Android, la vraie lampe
// du téléphone s'allume en plus ; l'iPhone ne permet pas à une page web de l'allumer.

const torch = { mode: 'white', lamp: false, flood: true };
// Sur un téléphone, l'œil seul éclaire peu : la torche occupe tout l'écran, comme une lampe de poche.
function floodLight() {
  $('.flood')?.remove();
  if (state.screen !== 'torch' || !torch.flood || kiosk) return;
  document.body.insertAdjacentHTML(
    'beforeend',
    `<div class="flood flood-${torch.mode}"><div class="row"><button class="btn" data-go="menu" type="button">Éteindre</button><button class="btn light" type="button" data-torch="${torch.mode === 'white' ? 'night' : 'white'}">${torch.mode === 'white' ? 'Veilleuse' : 'Lumière blanche'}</button><button class="btn light" id="torchEye" type="button">Voir dans l’œil</button></div></div>`,
  );
}
async function phoneLamp(on) {
  const track = state.camera?.getVideoTracks()[0];
  if (!on) return stopCamera();
  if (track || !/Android/i.test(navigator.userAgent)) return;
  try {
    const stream = await camera({ video: { facingMode: 'environment' }, audio: false });
    if (state.screen !== 'torch') return stream.getTracks().forEach((t) => t.stop());
    state.camera = stream;
    const [video] = stream.getVideoTracks();
    if (!video.getCapabilities?.().torch) return stopCamera();
    await video.applyConstraints({ advanced: [{ torch: true }] });
    torch.lamp = true;
    renderTorch();
  } catch {
    stopCamera();
  }
}
function renderTorch() {
  screen.innerHTML = `<div class="beam beam-${torch.mode}"></div>`;
  panel.innerHTML = `${backButton}<h2>Torche</h2>
    <p>L’œil de BeyaBear’s éclaire. ${torch.lamp ? 'La lampe du téléphone est allumée aussi.' : 'Montez la luminosité de l’écran au maximum pour plus de lumière.'}</p>
    <div class="row">
      <button class="btn ${torch.mode === 'white' ? '' : 'light'}" type="button" data-torch="white" aria-pressed="${torch.mode === 'white'}">Lumière blanche</button>
      <button class="btn ${torch.mode === 'night' ? '' : 'light'}" type="button" data-torch="night" aria-pressed="${torch.mode === 'night'}">Veilleuse</button>
    </div>
    <div class="row"><button class="btn" id="torchFull" type="button">Éclairer en plein écran</button><button class="btn light" data-go="menu" type="button">Éteindre</button></div>
    <p class="muted">Sur la peluche, une vraie petite lampe LED pourra être ajoutée à côté de l’écran et commandée de la même façon.</p>`;
}
function openTorch({ mode = 'white' } = {}) {
  Object.assign(torch, { mode, lamp: false, flood: true });
  renderTorch();
  floodLight();
  focusEye();
  keepAwake(true);
  phoneLamp(true);
}

// ---------- Météo : le temps qu'il fait là où habite la personne ----------
// Données : Open-Meteo (service ouvert, sans clé ; gratuit pour un usage non commercial).

const WEATHER = [
  [[0], 'Ciel dégagé', 'sun'],
  [[1, 2], 'Éclaircies', 'partly'],
  [[3], 'Couvert', 'cloud'],
  [[45, 48], 'Brouillard', 'fog'],
  [[51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82], 'Pluie', 'rain'],
  [[71, 73, 75, 77, 85, 86], 'Neige', 'snow'],
  [[95, 96, 99], 'Orage', 'storm'],
];
const weatherKind = (code) => WEATHER.find(([codes]) => codes.includes(code)) || [[], 'Temps variable', 'cloud'];
const SKY = {
  sun: '<circle cx="50" cy="42" r="17" fill="#ffd34d"/><g stroke="#ffd34d" stroke-width="4" stroke-linecap="round"><path d="M50 12v8M50 64v8M20 42h8M72 42h8M29 21l6 6M65 57l6 6M71 21l-6 6M35 57l-6 6"/></g>',
  partly: '<circle cx="38" cy="32" r="13" fill="#ffd34d"/><path d="M36 66h30a12 12 0 0 0 2-23.8A17 17 0 0 0 35 46a10 10 0 0 0 1 20z" fill="#f4f7fb"/>',
  cloud: '<path d="M30 64h38a14 14 0 0 0 2.3-27.8A20 20 0 0 0 31 41a11.5 11.5 0 0 0-1 23z" fill="#e8edf3"/>',
  fog: '<path d="M30 52h38a14 14 0 0 0 2.3-27.8A20 20 0 0 0 31 29a11.5 11.5 0 0 0-1 23z" fill="#dfe5ec"/><g stroke="#dfe5ec" stroke-width="4" stroke-linecap="round"><path d="M26 62h48M32 71h36"/></g>',
  rain: '<path d="M30 54h38a14 14 0 0 0 2.3-27.8A20 20 0 0 0 31 31a11.5 11.5 0 0 0-1 23z" fill="#dfe5ec"/><g stroke="#6cc3ff" stroke-width="4" stroke-linecap="round"><path d="M38 62l-3 9M51 62l-3 9M64 62l-3 9"/></g>',
  snow: '<path d="M30 54h38a14 14 0 0 0 2.3-27.8A20 20 0 0 0 31 31a11.5 11.5 0 0 0-1 23z" fill="#eef2f7"/><g fill="#fff"><circle cx="37" cy="66" r="3"/><circle cx="50" cy="70" r="3"/><circle cx="63" cy="66" r="3"/></g>',
  storm: '<path d="M30 52h38a14 14 0 0 0 2.3-27.8A20 20 0 0 0 31 29a11.5 11.5 0 0 0-1 23z" fill="#c9d1db"/><path d="M53 54l-9 13h8l-4 11 12-15h-8z" fill="#ffd34d"/>',
};
const skyIcon = (kind) => `<svg viewBox="0 0 100 84" aria-hidden="true">${SKY[kind]}</svg>`;
const weather = { place: store.get('place', null), data: null, message: '', view: 'card', frames: null, layer: '' };
async function loadWeather() {
  if (!weather.place) return;
  weather.message = 'Je regarde le ciel…';
  renderWeather();
  try {
    const { latitude, longitude } = weather.place;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('weather');
    weather.data = await response.json();
    weather.message = '';
  } catch {
    weather.data = null;
    weather.message = 'La météo n’est pas disponible pour l’instant.';
  }
  if (state.screen === 'weather') renderWeather();
}
async function setPlace(name) {
  weather.message = 'Je cherche cette ville…';
  renderWeather();
  try {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=fr`);
    const found = (await response.json()).results?.[0];
    if (!found) throw new Error('place');
    weather.place = { name: found.name, region: found.admin1 || found.country || '', latitude: found.latitude, longitude: found.longitude };
    store.set('place', weather.place);
    return loadWeather();
  } catch {
    weather.message = 'Je n’ai pas trouvé cette ville. Vérifiez son nom.';
    renderWeather();
  }
}
function useMyPosition() {
  if (!navigator.geolocation) return toast('La position n’est pas disponible sur cet appareil.');
  weather.message = 'Je cherche où vous êtes…';
  renderWeather();
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      weather.place = { name: 'Ma position', region: '', latitude: Math.round(coords.latitude * 100) / 100, longitude: Math.round(coords.longitude * 100) / 100 };
      store.set('place', weather.place);
      loadWeather();
    },
    () => {
      weather.message = 'Position refusée. Écrivez plutôt le nom de votre ville.';
      renderWeather();
    },
    { timeout: 10000 },
  );
}
// ---------- Carte météo animée ----------
// Fond de carte : OpenStreetMap. Images animées : RainViewer (nuages vus par satellite quand ils sont
// disponibles, sinon les pluies vues par radar). Les deux demandent une mention de leur origine.

const MAP_ZOOM = 6; // vue régionale : environ 1 200 km de large
// Position d'un lieu en nombre de tuiles, à ce niveau de zoom.
function tilePosition({ latitude, longitude }) {
  const n = 2 ** MAP_ZOOM;
  const rad = (latitude * Math.PI) / 180;
  return { x: ((longitude + 180) / 360) * n, y: ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n };
}
async function loadMapFrames() {
  try {
    const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    const data = await response.json();
    const clouds = data.satellite?.infrared || [];
    const rain = [...(data.radar?.past || []), ...(data.radar?.nowcast || [])];
    const useClouds = clouds.length > 2;
    const list = (useClouds ? clouds : rain).slice(-8);
    if (!list.length) throw new Error('frames');
    weather.layer = useClouds ? 'Nuages' : 'Pluies';
    weather.frames = list.map((frame) => ({ time: frame.time, base: data.host + frame.path, suffix: useClouds ? '/0/0_0.png' : '/2/1_1.png' }));
  } catch {
    weather.frames = [];
  }
}
let mapTimer = 0;
async function showWeatherMap() {
  clearInterval(mapTimer);
  if (!weather.place) return;
  screen.innerHTML = '<div class="say"><span><small>Carte météo</small>Je charge la carte…</span></div>';
  if (!weather.frames?.length) await loadMapFrames();
  if (state.screen !== 'weather' || weather.view !== 'map') return;
  if (!weather.frames.length) {
    screen.innerHTML = '<div class="say"><span><small>Carte météo</small>La carte n’est pas disponible pour l’instant.</span></div>';
    return;
  }
  const { x, y } = tilePosition(weather.place);
  const [tx, ty] = [Math.floor(x), Math.floor(y)];
  const n = 2 ** MAP_ZOOM;
  // Grille de 3 × 3 tuiles, chacune large comme la moitié de l'œil, centrée sur le lieu.
  const cells = [];
  for (let row = -1; row <= 1; row++) for (let col = -1; col <= 1; col++) cells.push({ col, row, tx: (((tx + col) % n) + n) % n, ty: ty + row });
  const place = (cell) => `style="left:${(cell.col + 1) * 33.3334}%;top:${(cell.row + 1) * 33.3334}%"`;
  const layer = (frame, i) =>
    `<div class="frame${i === weather.frames.length - 1 ? ' on' : ''}">${cells.map((cell) => `<img alt="" ${place(cell)} src="${frame.base}/256/${MAP_ZOOM}/${cell.tx}/${cell.ty}${frame.suffix}">`).join('')}</div>`;
  screen.innerHTML = `<div class="map"><div class="tiles" style="left:${50 - (1 + x - tx) * 50}%;top:${50 - (1 + y - ty) * 50}%">
      ${cells.map((cell) => `<img alt="" ${place(cell)} src="https://tile.openstreetmap.org/${MAP_ZOOM}/${cell.tx}/${cell.ty}.png">`).join('')}
      ${weather.frames.map(layer).join('')}
    </div><i class="pin"></i><span class="badge" id="mapTime"></span></div>`;
  let index = weather.frames.length - 1;
  const step = () => {
    const frames = document.querySelectorAll('#screen .frame');
    if (state.screen !== 'weather' || weather.view !== 'map' || !frames.length) return clearInterval(mapTimer);
    index = (index + 1) % frames.length;
    frames.forEach((frame, i) => frame.classList.toggle('on', i === index));
    const time = new Date(weather.frames[index].time * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    $('#mapTime').textContent = `${weather.layer} · ${time}`;
  };
  step();
  // Pause plus longue sur la dernière image, comme à la télévision.
  mapTimer = setInterval(step, 650);
}
function renderWeather() {
  if (state.screen !== 'weather') return;
  const { place, data } = weather;
  const now = data?.current;
  const [, label, kind] = weatherKind(now?.weather_code);
  // Dans l'œil : la carte animée, ou la fiche du temps qu'il fait.
  if (weather.view === 'map' && place) showWeatherMap();
  else screen.innerHTML = now
    ? `<div class="sky sky-${kind}"><small>${esc(place.name)}</small>${skyIcon(kind)}<strong>${Math.round(now.temperature_2m)}°</strong><span>${label}</span><em>${Math.round(data.daily.temperature_2m_min[0])}° / ${Math.round(data.daily.temperature_2m_max[0])}°</em></div>`
    : `<div class="say"><span><small>Météo</small>${esc(weather.message || 'Où habitez-vous ?')}</span></div>`;
  const days = data
    ? data.daily.time
        .slice(1)
        .map((day, i) => {
          const [, dayLabel, dayKind] = weatherKind(data.daily.weather_code[i + 1]);
          const name = new Date(day + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long' });
          return `<li class="day"><i>${skyIcon(dayKind)}</i><span><strong>${name}</strong> · ${dayLabel}</span><b>${Math.round(data.daily.temperature_2m_min[i + 1])}° / ${Math.round(data.daily.temperature_2m_max[i + 1])}°</b></li>`;
        })
        .join('')
    : '';
  panel.innerHTML = `${backButton}<h2>Météo</h2>
    ${now ? `<p><strong>${esc(place.name)}</strong>${place.region ? ', ' + esc(place.region) : ''} : ${label.toLowerCase()}, ${Math.round(now.temperature_2m)}° maintenant.</p>` : `<p>${esc(weather.message || 'Indiquez la ville où vous habitez : BeyaBear’s affiche le temps qu’il y fait dans son œil.')}</p>`}
    ${place ? `<div class="row"><button class="btn" id="mapToggle" type="button">${weather.view === 'map' ? 'Voir la météo du jour' : 'Voir la carte animée'}</button></div>` : ''}
    ${weather.view === 'map' ? '<p class="muted">Les nuages ou les pluies des dernières heures défilent dans l’œil, autour de votre ville.</p>' : ''}
    ${days ? `<ul class="favs">${days}</ul>` : ''}
    <form class="line" id="placeForm"><input name="city" maxlength="60" required placeholder="Votre ville (ex. Lyon)" aria-label="Votre ville" value="${place && place.name !== 'Ma position' ? esc(place.name) : ''}" autocomplete="off"><button class="btn">Valider</button></form>
    <div class="row"><button class="btn light" id="locate" type="button">Utiliser ma position</button></div>
    <p class="muted">La ville est gardée sur cet appareil. Données météo : Open-Meteo. Carte : © contributeurs OpenStreetMap, images RainViewer.</p>`;
}
function openWeather({ map = false } = {}) {
  weather.view = map ? 'map' : 'card';
  focusEye();
  renderWeather();
  if (weather.place) loadWeather();
}

// ---------- Visages : reconnaître les personnes enregistrées ----------
// Tout se passe sur l'appareil : la bibliothèque face-api (open source, MIT) calcule une empreinte du visage,
// gardée uniquement dans le navigateur de cet appareil. Aucune image ni empreinte n'est envoyée ailleurs.
// Chaque personne s'enregistre elle-même, avec son accord (celui d'un parent pour un enfant).

const FACE_MATCH = 0.5; // distance maximale entre deux empreintes d'une même personne
const faces = () => store.get('faces', []);
const faceDistance = (a, b) => Math.sqrt(a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0));
// Renvoie la personne enregistrée la plus proche de l'empreinte, ou null si aucune n'est assez proche.
function matchFace(descriptor, known = faces()) {
  let best = null;
  for (const person of known) {
    const distance = faceDistance(descriptor, person.d);
    if (distance < FACE_MATCH && (!best || distance < best.distance)) best = { name: person.name, distance };
  }
  return best;
}
function loadFaceLibrary() {
  return (loadFaceLibrary.loading ??= (async () => {
    await new Promise((resolve, reject) => {
      document.head.append(Object.assign(document.createElement('script'), { src: 'face/face-api.js', onload: resolve, onerror: reject }));
    });
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('face'),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri('face'),
      faceapi.nets.faceRecognitionNet.loadFromUri('face'),
    ]);
  })());
}
// Empreinte du visage visible dans la vidéo, ou null s'il n'y en a pas.
async function readFace(video) {
  const found = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
    .withFaceLandmarks(true)
    .withFaceDescriptor();
  return found ? Array.from(found.descriptor, (v) => Math.round(v * 1e4) / 1e4) : null;
}
const faceState = { ready: false, status: 'Préparation…', last: '' };
function renderFaces() {
  const list = faces();
  panel.innerHTML = `${backButton}<h2>Visages</h2>
    <p>BeyaBear’s reconnaît les personnes qui se sont enregistrées et les salue par leur prénom.</p>
    <p class="notice">Chaque personne s’enregistre elle-même, avec son accord (celui d’un parent pour un enfant). L’empreinte du visage reste sur cet appareil et peut être effacée à tout moment.</p>
    <p><strong id="faceStatus">${esc(faceState.status)}</strong></p>
    <form class="line" id="faceForm"><input name="name" maxlength="30" required placeholder="Prénom à enregistrer" aria-label="Prénom" autocomplete="off"><button class="btn" ${faceState.ready ? '' : 'disabled'}>Enregistrer ce visage</button></form>
    ${list.length ? `<p class="muted">Personnes enregistrées</p><ul class="favs">${list.map((person, i) => `<li><span class="btn light">${esc(person.name)}</span><button class="x" type="button" data-unface="${i}" aria-label="Effacer ${esc(person.name)}">×</button></li>`).join('')}</ul>` : '<p class="muted">Personne n’est encore enregistré.</p>'}`;
}
function faceStatus(text) {
  faceState.status = text;
  if ($('#faceStatus')) $('#faceStatus').textContent = text;
  const badge = $('.badge', screen);
  if (badge) badge.textContent = text;
}
async function openFaces() {
  Object.assign(faceState, { ready: false, status: 'Préparation de la reconnaissance…', last: '' });
  renderFaces();
  sayInEye('Je me prépare…', 'Visages');
  try {
    const [stream] = await Promise.all([camera({ video: { facingMode: 'user' }, audio: false }), loadFaceLibrary()]);
    if (state.screen !== 'face' || state.camera) return stream.getTracks().forEach((track) => track.stop());
    state.camera = stream;
  } catch (error) {
    if (state.screen !== 'face') return;
    const message = error?.name ? cameraError(error) : 'La reconnaissance des visages n’a pas pu se charger.';
    sayInEye(message, 'Visages');
    return faceStatus(message);
  }
  screen.innerHTML = '<video class="mirror" autoplay playsinline muted></video><span class="badge"></span>';
  const video = $('video', screen);
  showStream(video, state.camera);
  focusEye();
  faceState.ready = true;
  renderFaces();
  faceStatus('Regardez l’œil…');
  // Reconnaissance en continu tant que l'écran Visages est ouvert.
  const stream = state.camera;
  while (state.screen === 'face' && state.camera === stream) {
    try {
      if (video.videoWidth) {
        const descriptor = await readFace(video);
        if (state.screen !== 'face' || state.camera !== stream) break;
        faceState.descriptor = descriptor;
        const match = descriptor && matchFace(descriptor);
        const name = match?.name || '';
        faceStatus(!descriptor ? 'Aucun visage devant l’œil.' : name ? `Bonjour, ${name} !` : faces().length ? 'Visage non reconnu.' : 'Visage détecté. Enregistrez-le avec votre prénom.');
        // Salue à voix haute une seule fois à chaque nouvelle personne reconnue.
        if (name && name !== faceState.last && window.speechSynthesis && !window.speechSynthesis.speaking) {
          const hello = new SpeechSynthesisUtterance(`Bonjour, ${name} !`);
          hello.lang = 'fr-FR';
          hello.voice = frenchVoice() || null;
          window.speechSynthesis.speak(hello);
        }
        faceState.last = name;
      }
    } catch {
      faceStatus('La reconnaissance a rencontré un problème.');
    }
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
}
function enrollFace(name) {
  if (!faceState.descriptor) return toast('Placez votre visage bien en face de l’œil, puis réessayez.');
  store.set('faces', [...faces().filter((person) => person.name.toLowerCase() !== name.toLowerCase()), { name, d: faceState.descriptor }].slice(-12));
  faceState.last = '';
  renderFaces();
  toast(`Visage de ${name} enregistré sur cet appareil.`);
}

// ---------- Forfait eSIM : aperçu ----------
// Cet écran présente l'abonnement mobile de la peluche. Il ne vend rien pour l'instant : la souscription
// demande un partenaire eSIM, un paiement en ligne et un modem 4G dans la peluche (voir README).
// Les offres ci-dessous sont des exemples à remplacer par les vraies offres et leurs prix.

const ESIM_OFFERS = [
  { id: 'decouverte', name: 'Découverte', detail: 'Appels vidéo et assistant, usage occasionnel' },
  { id: 'famille', name: 'Famille', detail: 'Appels, vidéos et musique au quotidien' },
  { id: 'voyage', name: 'Voyage', detail: 'Pour emmener BeyaBear’s en vacances, sans Wi-Fi' },
];
function openEsim() {
  const saved = store.get('esim', {});
  const who = saved.who === 'adulte' ? 'adulte' : 'enfant';
  sayInEye(saved.offer ? 'Votre choix est noté.' : 'Pas encore de forfait.', 'Forfait');
  panel.innerHTML = `${backButton}<h2>Forfait BeyaBear’s</h2>
    <p>Avec un forfait eSIM, BeyaBear’s se connecte tout seul, partout, sans Wi-Fi. C’est un parent qui souscrit, pour son enfant ou pour lui-même.</p>
    <p class="notice"><strong>Aperçu.</strong> La souscription n’est pas encore ouverte : rien n’est vendu ni facturé ici. Les offres ci-dessous sont des exemples, leurs prix restent à définir.</p>
    <p class="muted">Pour qui ?</p>
    <div class="row">
      <button class="btn ${who === 'enfant' ? '' : 'light'}" type="button" data-esim-who="enfant" aria-pressed="${who === 'enfant'}">Mon enfant</button>
      <button class="btn ${who === 'adulte' ? '' : 'light'}" type="button" data-esim-who="adulte" aria-pressed="${who === 'adulte'}">Moi</button>
    </div>
    <p class="muted">Offres (exemples)</p>
    <ul class="favs">${ESIM_OFFERS.map(
      (offer) => `<li><button class="btn ${saved.offer === offer.id ? '' : 'light'} offer" type="button" data-esim-offer="${offer.id}" aria-pressed="${saved.offer === offer.id}"><span><strong>${offer.name}</strong><small>${offer.detail} · prix à définir</small></span></button></li>`,
    ).join('')}</ul>
    ${saved.offer ? `<p>Choix noté sur cet appareil : offre « ${esc(ESIM_OFFERS.find((o) => o.id === saved.offer)?.name || '')} » pour ${who === 'enfant' ? 'votre enfant' : 'vous'}. Vous pourrez souscrire dès l’ouverture du service.</p>` : ''}
    ${who === 'enfant' ? '<p class="muted">Pour un enfant, le forfait est au nom du parent, qui garde la main sur les proches autorisés et sur les applications.</p>' : ''}`;
}

// ---------- Iris ----------

function openIris() {
  panel.innerHTML = `${backButton}<h2>Couleur de l’iris</h2><p class="muted">Choisissez la teinte de l’œil.</p>
    <div class="colors">${Object.entries(COLORS)
      .map(([name, [hex]]) => `<button type="button" data-color="${name}" class="${name === state.color ? 'sel' : ''}" aria-pressed="${name === state.color}" style="background:${hex}" aria-label="${name}" title="${name}"></button>`)
      .join('')}</div><p id="colorName">${state.color}</p>`;
}
function setColor(name) {
  state.color = name;
  store.set('color', name);
  applyColor();
  if (state.screen === 'iris') openIris();
}

// ---------- Vidéos dans l'œil : YouTube et TikTok ----------
// Les deux se lisent dans l'œil avec leur lecteur officiel intégré. Ni YouTube ni TikTok ne laissent
// intégrer leur page d'accueil ou leur fil : il faut le lien d'une vidéo (ou d'une playlist YouTube).

const VIDEO = {
  youtube: {
    label: 'YouTube',
    hint: 'Collez le lien d’une vidéo ou d’une playlist YouTube.',
    placeholder: 'https://youtu.be/…',
    error: 'Lien YouTube non reconnu. Collez le lien complet de la vidéo ou de la playlist.',
    // Renvoie l'identifiant de la vidéo, ou « list:… » pour une playlist.
    parse(url, host) {
      if (host !== 'youtu.be' && host !== 'youtube.com' && host !== 'youtube-nocookie.com') return '';
      const video = host === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') || url.pathname.match(/\/(?:shorts|embed|live)\/([\w-]+)/)?.[1];
      if (/^[\w-]{11}$/.test(video || '')) return video;
      const list = url.searchParams.get('list');
      return /^[\w-]{12,64}$/.test(list || '') ? 'list:' + list : '';
    },
    src: (id) =>
      id.startsWith('list:')
        ? `https://www.youtube-nocookie.com/embed/videoseries?list=${id.slice(5)}&autoplay=1&playsinline=1&rel=0&fs=0`
        : `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&fs=0`,
    // Exemples proposés tant qu'aucun favori n'est enregistré.
    starters: [
      { id: 'XqZsoesa55w', name: 'Baby Shark' },
      { id: 'aqz-KE-bpKQ', name: 'Big Buck Bunny' },
    ],
  },
  tiktok: {
    label: 'TikTok',
    hint: 'Collez le lien complet d’une vidéo TikTok (tiktok.com/@compte/video/…).',
    placeholder: 'https://www.tiktok.com/@…/video/…',
    error: 'Lien TikTok non reconnu. Dans TikTok : Partager, Copier le lien, puis ouvrez-le une fois pour obtenir le lien complet.',
    parse(url, host) {
      const id = host === 'tiktok.com' ? url.pathname.match(/\/(?:video|player\/v1)\/(\d{10,25})/)?.[1] : '';
      return id || '';
    },
    src: (id) => `https://www.tiktok.com/player/v1/${id}?autoplay=1&description=0&music_info=0&rel=0`,
    starters: [],
  },
};
const videoKey = (app) => (app === 'youtube' ? 'videos' : 'videos.' + app);
function videoId(app, link) {
  try {
    const url = new URL(link.trim());
    return VIDEO[app].parse(url, url.hostname.toLowerCase().replace(/^(www\.|m\.|music\.)/, ''));
  } catch {
    return '';
  }
}
function playVideo(app, id) {
  if (!/^(list:)?[\w-]{10,64}$/.test(id)) return;
  // Lecture dans l'œil : pas de plein écran, et l'œil s'agrandit pour regarder.
  screen.innerHTML = `<iframe title="${VIDEO[app].label}" allow="autoplay; encrypted-media" playsinline src="${VIDEO[app].src(id)}"></iframe>`;
  focusEye();
}
// Recherche YouTube : par le serveur BeyaBear’s, qui détient la clé de l'API YouTube.
const search = { q: '', videos: [], message: '' };
function searchResultsHtml() {
  if (search.message) return `<p class="muted">${esc(search.message)}${search.q ? ` <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(search.q)}" target="_blank" rel="noopener">Ouvrir la recherche sur YouTube</a>, puis copiez le lien de la vidéo.` : ''}</p>`;
  if (!search.videos.length) return '';
  return `<p class="muted">Résultats pour « ${esc(search.q)} »</p><ul class="favs">${search.videos.map((v) => `<li><button class="btn light" type="button" data-video="${esc(v.id)}">${ICON.youtube}<span>${esc(v.title)}</span></button></li>`).join('')}</ul>`;
}
// Cherche des vidéos et lance la première dans l'œil.
async function searchYoutube(q) {
  Object.assign(search, { q, videos: [], message: 'Recherche…' });
  const show = () => $('#searchResults') && ($('#searchResults').innerHTML = searchResultsHtml());
  show();
  await serverReady;
  if (!state.youtube) {
    search.message = state.server ? 'La recherche demande une clé YouTube sur le serveur.' : 'La recherche demande la version complète, avec son serveur.';
    sayInEye('La recherche YouTube n’est pas encore branchée.', 'YouTube');
    return show();
  }
  try {
    const { videos } = await api('api/youtube?q=' + encodeURIComponent(q));
    Object.assign(search, { videos, message: videos.length ? '' : 'Aucune vidéo trouvée.' });
    if (state.screen !== 'youtube') return;
    show();
    if (videos.length) playVideo('youtube', videos[0].id);
  } catch (error) {
    search.message = error.message === 'youtube_quota' ? 'Le nombre de recherches du jour est atteint.' : 'La recherche n’a pas abouti.';
    show();
  }
}
// Mots à retirer d'une phrase comme « Beya, mets des comptines sur YouTube » pour garder la recherche.
const SEARCH_NOISE = /\b(beya ?bears?|bea ?bears?|beya|bea|baya|mets?|mettre|lance|ouvre|montre|affiche|joue|cherche|trouve|moi|nous|sur|dans|you ?tube|videos?|une?|des|du|de la|de|les?|la|l|s il te plait|stp)\b/g;
function openVideo(app, { spoken = '' } = {}) {
  const { label, hint, placeholder, starters } = VIDEO[app];
  const favorites = store.get(videoKey(app), []);
  const item = (v, removable, i) =>
    `<li><button class="btn light" type="button" data-video="${esc(v.id)}">${ICON[app]}${esc(v.name)}</button>${removable ? `<button class="x" type="button" data-unfav="${i}" aria-label="Retirer ${esc(v.name)}">×</button>` : ''}</li>`;
  panel.innerHTML = `${backButton}<h2>${label} dans l’œil</h2>
    <p class="muted">${hint} Donnez-lui un nom pour la retrouver et la lancer à la voix.</p>
    <form class="stack" id="videoForm"><input name="link" type="url" required placeholder="${placeholder}" aria-label="Lien de la vidéo"><input name="name" maxlength="40" placeholder="Nom du favori (facultatif)" aria-label="Nom du favori"><button class="btn">Lire dans l’œil</button></form>
    <p class="error" id="videoError"></p>
    ${
      app === 'youtube'
        ? `<form class="line" id="searchForm"><input name="q" maxlength="80" required placeholder="Chercher une vidéo (ex. comptines)" aria-label="Chercher sur YouTube" autocomplete="off"><button class="btn light">Chercher</button></form>
           <div id="searchResults">${searchResultsHtml()}</div>`
        : ''
    }
    ${favorites.length ? `<p class="muted">Mes favoris</p><ul class="favs">${favorites.map((v, i) => item(v, true, i)).join('')}</ul>` : ''}
    ${starters.length ? `<p class="muted">Exemples</p><ul class="favs">${starters.map((v) => item(v, false)).join('')}</ul>` : ''}
    <p class="muted">Le fil d’accueil de ${label} ne peut pas s’afficher dans une page web : ${label} ne l’autorise que dans sa propre application. Sur la peluche, il s’affichera dans l’œil par la recopie du téléphone.</p>`;
  // L'œil ne reste pas vide : on lance le favori demandé, sinon le premier favori ou le premier exemple.
  const text = spoken.toLowerCase();
  const named = text && favorites.find((v) => text.includes(v.name.toLowerCase()));
  // « Mets des comptines sur YouTube » : ce qui reste de la phrase devient une recherche.
  const query = app === 'youtube' && !named ? plain(spoken).replace(/[’']/g, ' ').replace(SEARCH_NOISE, ' ').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim() : '';
  if (query.length > 1) return searchYoutube(query);
  const pick = named || favorites[0] || starters[0];
  if (pick) playVideo(app, pick.id);
  else sayInEye('Collez le lien d’une vidéo pour la voir ici.', label);
}

// ---------- Photo ----------

// Affiche un flux caméra dans une vidéo muette et lance la lecture : sans cela, certains
// navigateurs restent figés sur la première image.
function showStream(video, stream) {
  video.srcObject = stream;
  video.play().catch(() => {});
}
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
    const stream = await camera({ video: { facingMode: 'user' }, audio: false });
    if (state.screen !== 'photo' || state.camera) return stream.getTracks().forEach((track) => track.stop());
    state.camera = stream;
    screen.innerHTML = '<video class="mirror" autoplay playsinline muted></video>';
    showStream($('video', screen), state.camera);
    focusEye();
    renderPhoto();
  } catch (error) {
    if (state.screen === 'photo') sayInEye(cameraError(error), 'Photo');
  }
}
function renderPhoto() {
  const shots = store.get('shots', []);
  panel.innerHTML = `${backButton}<h2>Photo</h2>
    <div class="row">
      ${state.camera ? `<button class="btn" id="snap" type="button">${ICON.photo}Prendre la photo</button>` : `<button class="btn" data-go="photo" type="button">${ICON.photo}Nouvelle photo</button>`}
      ${state.shot ? '<a class="btn light" id="save" download="beyabears-photo.jpg">Enregistrer</a>' : ''}
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
  screen.innerHTML = `<img alt="Photo prise par BeyaBear’s" src="${dataUrl}">`;
}

// ---------- Voix : parole de BeyaBear’s ----------

let speechRun = 0;
function stopSpeaking() {
  speechRun++;
  const synth = window.speechSynthesis;
  if (synth && (synth.speaking || synth.pending)) synth.cancel();
  if (!voice.paused) voice.pause();
  eye.classList.remove('listening', 'thinking');
}
// Sur iPhone, la synthèse vocale doit avoir été lancée une première fois depuis un geste.
function primeSpeech() {
  if (primeSpeech.done || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
  primeSpeech.done = true;
  const silent = new SpeechSynthesisUtterance(' ');
  silent.volume = 0;
  window.speechSynthesis.speak(silent);
}
function frenchVoice() {
  const voices = window.speechSynthesis?.getVoices() || [];
  return voices.find((v) => /^fr/i.test(v.lang) && /am[ée]lie|audrey|aurelie|google/i.test(v.name)) || voices.find((v) => /^fr/i.test(v.lang));
}
// La voix de BeyaBear’s. Les phrases prévues (histoires, petites réponses) ont un enregistrement dans voix/ :
// une voix douce, la même sur tous les appareils, que l'iPhone lit comme n'importe quel son.
// Les autres phrases (réponses de l'assistant, heure, prénoms) passent par la voix de l'appareil.
const voice = new Audio();
voice.preload = 'auto';
const SILENCE = 'data:audio/wav;base64,UklGRv////9XQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAATElTVBoAAABJTkZPSVNGVA4AAABMYXZmNjAuMTYuMTAwAGRhdGH/////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
// Les navigateurs ne laissent une page jouer du son qu'après un toucher : on débloque le lecteur au premier.
function unlockVoice() {
  if (unlockVoice.done) return;
  unlockVoice.done = true;
  voice.src = SILENCE;
  voice.play().then(() => voice.src === SILENCE && voice.pause(), () => (unlockVoice.done = false));
}
document.addEventListener('pointerdown', unlockVoice);
const hasRecording = (sentence) => typeof VOICE_FILES !== 'undefined' && VOICE_FILES.has(voiceKey(sentence));
function sayWithDevice(sentence) {
  return new Promise((resolve) => {
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
function sayRecorded(sentence) {
  return new Promise((resolve) => {
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      clearTimeout(limit);
      voice.onended = voice.onerror = null;
      resolve();
    };
    // Garde-fou : si le son ne se termine jamais, le texte continue quand même d'avancer.
    const limit = setTimeout(done, 4000 + sentence.length * 130);
    voice.onended = done;
    voice.onerror = () => sayWithDevice(sentence).then(done);
    voice.src = `voix/${voiceKey(sentence)}.mp3`;
    // Lecture refusée (aucun toucher encore) : garder le rythme de lecture du texte.
    voice.play().catch(() => setTimeout(done, 1200 + sentence.length * 70));
  });
}
// Dit le texte phrase par phrase et affiche la phrase en cours dans l'œil.
async function speak(text, label = 'BeyaBear’s') {
  stopSpeaking();
  stopRecognizer(); // BeyaBear’s ne doit pas s'entendre parler
  const run = speechRun;
  for (const sentence of splitSentences(text)) {
    if (run !== speechRun) return;
    sayInEye(sentence, label);
    await (hasRecording(sentence) ? sayRecorded(sentence) : sayWithDevice(sentence));
  }
  if (run === speechRun && state.wake) startWake();
}

// ---------- Assistant ----------

function openChat() {
  renderChat();
  sayInEye('Je t’écoute.', 'Assistant');
}
function renderChat() {
  panel.innerHTML = `${backButton}<h2>Assistant</h2>
    ${state.assistant ? '' : '<p class="notice"><strong>Mode démonstration.</strong> BeyaBear’s répond ici avec quelques réponses et histoires intégrées. La conversation libre, sur n’importe quel sujet, s’active quand l’assistant est branché (voir README).</p>'}
    <div class="talk" id="talk">${state.talk.map((m) => `<div class="${m.role}">${esc(m.content)}</div>`).join('')}</div>
    <div class="row"><button class="btn" data-listen type="button">${ICON.mic}Parler</button><button class="btn light" id="quiet" type="button">Silence</button></div>
    <form class="line" id="chatForm"><input name="text" maxlength="500" required placeholder="Ou écrivez ici…" aria-label="Message pour BeyaBear’s" autocomplete="off"><button class="btn">Envoyer</button></form>`;
  const talk = $('#talk');
  talk.scrollTop = talk.scrollHeight;
}
// ---------- Réponses intégrées : BeyaBear’s sans assistant branché ----------
// Quelques réponses et histoires embarquées, pour que la peluche parle même sans serveur ni clé.
// Ce n'est pas une intelligence artificielle : ce qui n'est pas prévu ici reçoit une réponse d'attente.



let storyIndex = 0;
let jokeIndex = 0;
// Écran Histoires : chaque histoire démarre au toucher, directement dans l'œil.
function openStories({ play = false } = {}) {
  renderStories();
  if (play) return playStory(storyIndex++ % STORIES.length);
  sayInEye('Choisis une histoire.', 'Histoire');
}
function renderStories(playing = -1) {
  panel.innerHTML = `${backButton}<h2>Histoires</h2>
    <p class="muted">Touchez une histoire : BeyaBear’s la raconte à voix haute, et elle défile dans son œil.</p>
    <ul class="favs">${STORIES.map((story, i) => `<li><button class="btn ${i === playing ? '' : 'light'}" type="button" data-story="${i}">${ICON.story}${story.title}</button></li>`).join('')}</ul>
    <div class="row"><button class="btn light" id="quiet" type="button">Arrêter l’histoire</button></div>
    ${state.assistant ? '<div class="row"><button class="btn light" id="newStory" type="button">Inventer une nouvelle histoire</button></div>' : ''}`;
}
function playStory(index) {
  const story = STORIES[index];
  if (!story) return;
  if (state.screen !== 'story') setScreen('story');
  renderStories(index);
  focusEye();
  speak(story.text, 'Histoire');
}
async function builtInReply(spoken) {
  const text = plain(spoken);
  await new Promise((resolve) => setTimeout(resolve, 500));
  const now = new Date();
  const reply = /\b(histoire|conte|raconte)\b/.test(text)
    ? STORIES[storyIndex++ % STORIES.length].text
    : /\b(blague|rigol|rire|drole)\b/.test(text)
      ? JOKES[jokeIndex++ % JOKES.length]
      : /quelle heure|l.heure\b/.test(text)
        ? `Il est ${now.toLocaleTimeString('fr-FR', { hour: 'numeric', minute: '2-digit' }).replace(':', ' heures ')}.`
        : /quel jour|la date|on est quel/.test(text)
          ? `Nous sommes le ${now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}.`
          : /qui es.tu|tu es qui|comment tu t.appelles|ton nom|c.est quoi (beya|bea)/.test(text)
            ? REPLIES.who
            : /que sais.tu|tu sais faire|peux.tu faire|tu fais quoi|a quoi tu sers/.test(text)
              ? REPLIES.skills
              : /\b(bonjour|salut|coucou|bonsoir|hello)\b/.test(text)
                ? REPLIES.hello
                : /ca va|comment vas.tu|tu vas bien/.test(text)
                  ? REPLIES.fine
                  : /\bmerci\b/.test(text)
                    ? REPLIES.thanks
                    : /bonne nuit|dodo|dormir/.test(text)
                      ? REPLIES.night
                      : /je t.aime|calin/.test(text)
                        ? REPLIES.love
                        : REPLIES.unknown;
  return { reply };
}

const CHAT_ERRORS = {
  assistant_non_configure: 'L’assistant n’est pas encore branché.',
  cle_invalide: 'La clé de l’assistant est refusée.',
  trop_de_demandes: 'Trop de demandes pour l’instant. Réessayez dans une minute.',
};
async function ask(text) {
  if (call.role || call.busy) return toast('Dites « raccroche » pour terminer l’appel.');
  if (state.incoming) return;
  if (state.screen !== 'chat') {
    stopCamera();
    setScreen('chat');
    screen.replaceChildren();
  }
  focusEye();
  state.talk.push({ role: 'user', content: text });
  renderChat();
  stopSpeaking();
  const run = speechRun;
  eye.classList.add('thinking');
  sayInEye('…', 'Je réfléchis');
  try {
    await serverReady;
    const { reply } = state.assistant
      ? await api('api/chat', { device: deviceId, messages: state.talk.slice(-12).filter((m, i, list) => i > 0 || m.role === 'user') })
      : await builtInReply(text);
    const story = /\b(histoire|conte)\b/.test(plain(text));
    state.talk.push({ role: 'assistant', content: reply });
    if (state.screen !== 'chat' || run !== speechRun) return;
    renderChat();
    speak(reply, story ? 'Histoire' : 'BeyaBear’s');
  } catch (error) {
    state.talk.pop();
    if (state.screen !== 'chat') return;
    eye.classList.remove('thinking');
    renderChat();
    sayInEye(CHAT_ERRORS[error.message] || (state.server ? 'Je n’arrive pas à répondre pour l’instant.' : DEMO_ONLY), 'Assistant');
  }
}

// ---------- Voix : écoute et commandes ----------

const VOICE_COLORS = [[/\b(azur|bleue?)\b/, 'Azur'], [/\b([ée]meraude|verte?)\b/, 'Émeraude'], [/\b(ambre|orange|dor[ée]e?)\b/, 'Ambre'], [/\b(violet(te)?|mauve)\b/, 'Violet']];
const ORDER = /\b(mets?|mettre|lance|ouvre|montre|affiche|joue|d[ée]marre|va sur)\b/;
// Exécute une commande reconnue. Renvoie false si la phrase n'en est pas une.
// Les motifs exigent une forme d'ordre : une phrase banale doit aller à l'assistant, pas lancer une application.
// Minuscules sans accents : les limites de mots des motifs ne reconnaissent que les lettres non accentuées.
const plain = (spoken) => spoken.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/œ/g, 'oe');
function command(spoken) {
  const text = plain(spoken);
  const order = ORDER.test(text);
  const color = VOICE_COLORS.find(([pattern]) => pattern.test(text));
  if (/\braccroche[rz]?\b|termine l.appel/.test(text)) return call.role || call.busy ? (endCall(), true) : false;
  if (/\b(arr[êe]te|stop|ferme|accueil|silence|tais-toi)\b/.test(text)) return go('home'), true;
  if (state.screen === 'photo' && state.camera && /\b(prends|prendre|clic|ouistiti|cheese)\b/.test(text)) return snap(), true;
  if (/you ?tube/.test(text) || (order && /\bvid[ée]o\b/.test(text))) return go('youtube', { spoken }), true;
  if (/tik ?tok/.test(text)) return go('tiktok', { spoken }), true;
  const external = EXTERNAL.find(([id]) => text.replace(/\s/g, '').includes(id));
  if (external) return go('home'), offerExternal(external), true;
  if (order && /\b(t[ée]l[ée]phone|portable|iphone)\b/.test(text) && !/\btelephone a\b/.test(text)) return go('phone'), true;
  if (/(?<![mts]['’])\b(appelle|appeler|appelez)\b|\btelephone a\b/.test(text)) return go('call', { spoken }), true;
  if (/\b(photo|cam[ée]ra)\b/.test(text) && (order || /\bprend/.test(text))) return go('photo'), true;
  if (/\b(raconte|lis|dis)\b.*\b(histoire|conte)\b/.test(text)) return go('story', { play: true }), true;
  if (/\b(torche|lampe|lumiere|eclaire|veilleuse)\b/.test(text)) return /\b(eteins|eteindre)\b/.test(text) ? (go('menu'), true) : (go('torch', { mode: /veilleuse/.test(text) ? 'night' : 'white' }), true);
  if (/quelle heure|\bl.heure\b|\bhorloge\b/.test(text)) return go('clock'), true;
  if (/\b(meteo|quel temps|temps qu.il fait|il fait beau|pleut|nuages)\b/.test(text)) return go('weather', { map: /\b(carte|nuages|radar)\b/.test(text) }), true;
  if (order && /\bassistant\b/.test(text)) return go('chat'), true;
  if (order && /\b(forfait|abonnement|esim)\b/.test(text)) return go('esim'), true;
  if (/\b(jeux?|jouer|joue|on joue)\b/.test(text) && !/you ?tube|musique|video/.test(text)) return go('games', /paire|memo/.test(text) ? { game: 'paires' } : /etoile/.test(text) ? { game: 'etoiles' } : {}), true;
  if (/\b(reconnais|qui suis.je|visages?)\b/.test(text)) return go('face'), true;
  if (color && (/\b(iris|œil|oeil|yeux|couleur)\b/.test(text) || /\ben\s/.test(text))) return go('home'), setColor(color[1]), true;
  if (order && /\b(iris|œil|oeil)\b/.test(text)) return go('home'), true;
  if (order && /\b(menu|applications?)\b/.test(text)) return setView(true), go('menu'), true;
  return false;
}
function heard(spoken) {
  const text = spoken.trim();
  if (!text) return;
  // Pendant une sonnerie, la voix ne sert qu'à répondre ou refuser.
  if (state.incoming) {
    const low = plain(text);
    if (/\b(refuse|non)\b/.test(low)) declineIncoming();
    else if (/r[ée]pond|d[ée]croch|accepte|\boui\b|all[oô]/.test(low)) acceptIncoming();
    return;
  }
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
  primeSpeech();
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
// Écoute continue : n'agit que si la phrase contient « BeyaBear’s » (ou ce que le navigateur en transcrit).
const WAKE = /(?:^|[\s,.!?])((?:b[eéè]y?a|baya)(?:[\s-]?b(?:ear|er|ère|air|aire)s?)?)(?![a-zà-ÿ])[\s,.!?]*/i;
function startWake() {
  // Pas d'écoute continue pendant un appel (micro partagé) ni pendant que BeyaBear’s parle.
  if (!SpeechRecognition || !state.wake || recognizer || call.role || call.busy || window.speechSynthesis?.speaking) return;
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
// BeyaBear’s ouvre l'appel quand il appelle ; le proche l'ouvre quand c'est lui qui appelle BeyaBear’s.

const call = { id: '', role: '', pc: null, local: null, cursor: '', timer: 0, muted: false, status: '', connected: false, busy: false, ring: '', name: '', polls: 0, run: 0, peer: null, conns: [], remote: '', media: null, wa: null };
// Adresse de la page sans ses paramètres : l'application peut être servie dans un sous-dossier.
const pageUrl = location.origin + location.pathname;
const callLink = () => `${pageUrl}?appel=${call.id}`;
const contactLink = (id) => `${pageUrl}?proche=${id}`;
const contacts = () => store.get('contacts', []);
const myRingSide = guestMode ? 'guest' : 'eye';
const peerLabel = () => call.name || (guestMode ? 'BeyaBear’s' : 'ton proche');

function openCall({ start = false, spoken = '' } = {}) {
  renderCall();
  if (guestMode || state.incoming) return;
  const text = spoken.toLowerCase();
  const named = text && contacts().find((c) => text.includes(c.name.toLowerCase()));
  if (named) return startCall('eye', { contact: named });
  if (start) return startCall('eye');
  if (spoken) sayInEye(contacts().length ? 'Qui veux-tu appeler ?' : 'Ajoutez un proche pour l’appeler à la voix.', 'Appels');
}
function renderCall() {
  const active = Boolean(call.role);
  const busy = call.busy ? 'disabled' : '';
  let body;
  if (active) {
    // Message WhatsApp prêt à envoyer : le proche touche le lien et l'appel démarre.
    const message = encodeURIComponent(`Appel vidéo BeyaBear’s : touche ce lien pour me rejoindre. ${callLink()}`);
    const invite =
      !guestMode && !call.ring && call.role === 'eye' && !call.connected
        ? `<div class="row"><a class="btn" href="https://wa.me/${call.wa?.phone || ''}?text=${message}" target="_blank" rel="noopener">${ICON.chat}Envoyer${call.wa ? ' à ' + esc(call.wa.name) : ''} par WhatsApp</a>
           <button class="btn light" data-share="${esc(callLink())}" type="button">Autre envoi</button></div>
           <p class="muted"><strong>Après l’envoi, revenez sur cette page</strong> : c’est ici que l’appel arrive. Dès que votre proche touche le lien, son visage apparaît dans l’œil. Il peut aussi scanner ce code.</p>${qrSvg(callLink())}`
        : '';
    body = `<p><strong>${esc(call.status)}</strong></p>
      <div class="row"><video class="self" id="self" autoplay playsinline muted></video></div>
      <div class="row"><button class="btn danger" id="hangup" type="button">Raccrocher</button><button class="btn light" id="mute" type="button">${call.muted ? 'Réactiver le micro' : 'Couper le micro'}</button></div>
      ${invite}
      ${
        call.peer
          ? `<div class="diag"><p class="muted">État de la connexion</p><ul>${diagText().map((line) => `<li>${esc(line)}</li>`).join('')}</ul>
             ${diag.ice === 'failed' || (diag.peer && !call.connected && !diag.kinds.has('relay')) ? '<p class="muted">Si la liaison vidéo reste impossible, les deux réseaux ne peuvent pas se joindre directement : essayez avec les deux téléphones en Wi-Fi, ou ajoutez un serveur de secours dans Appels, « Réglages du relais vidéo ».</p>' : ''}</div>`
          : '<details><summary>Si l’appel ne se connecte pas</summary><p class="muted">Vérifiez que les deux appareils ont autorisé la caméra et le micro. Sur certains réseaux (4G, Wi-Fi d’entreprise), un serveur relais doit être ajouté au projet.</p></details>'
      }`;
  } else if (state.incoming) {
    body = `<p><strong>${esc(state.incoming.name)} vous appelle…</strong></p>
      <div class="row"><button class="btn" data-call="accept" type="button" ${busy}>${ICON.call}Répondre</button><button class="btn danger" data-call="decline" type="button">Refuser</button></div>`;
  } else if (contactId) {
    body = state.me
      ? `<p>${esc(call.status || `Bonjour ${state.me.name} ! Vous êtes relié à la peluche BeyaBear’s.`)}</p>
         <div class="row"><button class="btn" id="callBoozzo" type="button" ${busy}>${ICON.call}Appeler BeyaBear’s</button></div>
         <p class="muted">Gardez cette page ouverte pour recevoir les appels de BeyaBear’s, et touchez-la une fois pour activer la sonnerie. Ajoutez-la à l’écran d’accueil de votre téléphone pour la retrouver.</p>`
      : `<p>${esc(call.status || 'Connexion à BeyaBear’s…')}</p>`;
  } else if (guestCallId) {
    body = `<p>${esc(call.status || 'Un proche vous appelle depuis sa peluche BeyaBear’s.')}</p>
      <div class="row"><button class="btn" id="answer" type="button" ${busy}>${ICON.call}Répondre</button></div>
      <p class="muted">Votre caméra et votre micro seront partagés avec votre proche pendant l’appel.</p>`;
  } else {
    const list = contacts();
    const fresh = state.newContact;
    body = `<p>${esc(call.status || 'Appelez un proche : son visage apparaît dans l’œil de BeyaBear’s.')}</p>
      ${list.length ? `<ul class="favs">${list.map((c) => `<li><button class="btn" type="button" data-contact="${c.id}" ${busy}>${ICON.call}${esc(c.name)}</button>${c.phone ? `<button class="btn light wa" type="button" data-wa="${c.id}" ${busy} title="Ouvrir un appel et envoyer le lien par WhatsApp">Lien WhatsApp</button>` : ''}<button class="x" type="button" data-link="${c.id}" aria-label="Lien de ${esc(c.name)}" title="Afficher le lien">QR</button><button class="x" type="button" data-forget="${c.id}" aria-label="Retirer ${esc(c.name)}">×</button></li>`).join('')}</ul>` : ''}
      ${
        fresh
          ? `<div class="invite"><p><strong>Lien de ${esc(fresh.name)}</strong></p>${qrSvg(contactLink(fresh.id))}
             <p class="muted">À ouvrir une seule fois sur le téléphone de ${esc(fresh.name)}, qui garde la page. Ensuite, dites « Beya, appelle ${esc(fresh.name)} ».</p>
             <div class="row"><button class="btn light" data-share="${esc(contactLink(fresh.id))}" type="button">Envoyer le lien</button></div></div>`
          : ''
      }
      <form class="stack" id="contactForm"><input name="name" maxlength="30" required placeholder="Prénom du proche (ex. Mamie)" aria-label="Prénom du proche" autocomplete="off"><input name="phone" type="tel" maxlength="20" placeholder="Numéro WhatsApp, facultatif (ex. +33 6 12 34 56 78)" aria-label="Numéro WhatsApp, facultatif" autocomplete="off"><button class="btn light">Ajouter ce proche</button></form>
      <div class="row"><button class="btn" id="startCall" type="button" ${busy}>${ICON.call}Appeler avec un lien WhatsApp</button></div>
      <p class="muted">BeyaBear’s ouvre l’appel et prépare un message WhatsApp avec un lien. Votre proche le touche, et son visage apparaît dans l’œil.</p>
      <div class="row"><button class="btn light" id="deviceTest" type="button" ${busy}>${ICON.photo}Tester ma caméra et mon micro</button></div>
      <div id="deviceResult"></div>
      <details><summary>Réglages du relais vidéo</summary>
        <p class="muted">Quand deux réseaux ne peuvent pas se joindre directement (4G, certaines box), la vidéo passe par un serveur de secours « TURN ». Si vous en avez un, enregistrez-le ici : il reste sur cet appareil.</p>
        <form class="stack" id="turnForm">
          <input name="urls" placeholder="turn:adresse:3478" aria-label="Adresse du serveur TURN" value="${esc(store.get('turn', {}).urls || '')}" autocomplete="off">
          <input name="username" placeholder="Identifiant" aria-label="Identifiant TURN" value="${esc(store.get('turn', {}).username || '')}" autocomplete="off">
          <input name="credential" placeholder="Mot de passe" aria-label="Mot de passe TURN" value="${esc(store.get('turn', {}).credential || '')}" autocomplete="off">
          <button class="btn light">Enregistrer</button>
        </form>
      </details>`;
  }
  panel.innerHTML = `${guestMode ? '' : backButton}<h2>Appel dans l’œil</h2>${body}`;
  if ($('#self') && call.local) showStream($('#self'), call.local);
}
function setCallStatus(status) {
  call.status = status;
  if (state.screen === 'call') renderCall();
}
function showLocalInEye(badge) {
  screen.innerHTML = `<video class="mirror" autoplay playsinline muted></video><span class="badge">${esc(badge)}</span>`;
  showStream($('video', screen), call.local);
}
const signal = (type, sdp) => api(`api/calls/${call.id}/signal`, { from: call.role, type, sdp });
const postRing = (contact, body) =>
  fetch(`api/contacts/${contact}/ring`, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {});
const setRing = (contact, callId) => postRing(contact, { call: callId, from: myRingSide });
// N'arrête la sonnerie que si c'est bien celle de cet appel : l'autre côté a pu en lancer une entre-temps.
const clearRing = (contact, callId) => postRing(contact, { call: null, if: callId });

// role 'eye' : ouvrir un appel (et faire sonner `contact` s'il est donné). role 'guest' : rejoindre `callId`.
async function startCall(role, { callId = '', contact = null, wa = null } = {}) {
  if (call.role || call.busy) return;
  stopCamera();
  stopSpeaking();
  stopRecognizer();
  if (state.screen !== 'call') {
    setScreen('call');
    screen.replaceChildren();
  }
  // Chaque étape asynchrone vérifie que l'appel n'a pas été abandonné entre-temps (endCall incrémente call.run).
  const run = ++call.run;
  call.busy = true;
  call.name = contact?.name || '';
  call.wa = wa;
  setCallStatus('Ouverture de la caméra…');
  await serverReady;
  if (run !== call.run) return;
  // Sans serveur BeyaBear’s, l'appel par lien passe par le relais public PeerJS ; la sonnerie d'un proche, elle, a besoin du serveur.
  const viaRelay = role === 'eye' ? !state.server : callId.startsWith(RELAY_PREFIX);
  if (viaRelay && contact?.id) {
    call.busy = false;
    return setCallStatus(DEMO_ONLY);
  }
  let stream;
  try {
    stream = await camera({ video: { facingMode: 'user' }, audio: true });
  } catch (error) {
    if (run !== call.run) return;
    call.busy = false;
    sayInEye(cameraError(error), 'Appel');
    return setCallStatus(cameraError(error));
  }
  if (run !== call.run) return stream.getTracks().forEach((track) => track.stop());
  call.local = stream;
  if (viaRelay) return startRelayCall(role, callId, run);
  try {
    let id = callId;
    let cursor = '';
    if (role === 'eye') id = (await api('api/calls', {})).id;
    // Ignore les anciens messages si la page a été rechargée.
    else cursor = (await api(`api/calls/${id}/signal?for=guest`)).cursor;
    if (run !== call.run) return;
    Object.assign(call, { id, cursor, role, busy: false, connected: false, muted: false, polls: 0, ring: '' });
    if (role === 'guest') await signal('join');
    else if (contact) {
      call.ring = contact.id;
      await setRing(contact.id, id);
    }
    if (run !== call.run) return;
  } catch (error) {
    if (run !== call.run) return;
    endCall(false, false);
    return setCallStatus(error.status === 404 ? 'Cet appel est terminé ou le lien a expiré.' : state.server ? 'Impossible d’ouvrir l’appel. Réessayez.' : DEMO_ONLY);
  }
  const waiting = role === 'guest' ? 'Connexion…' : call.ring ? `Appel de ${peerLabel()}…` : 'En attente de ton proche';
  if (role === 'eye' && kiosk && !call.ring) screen.innerHTML = qrSvg(callLink());
  else showLocalInEye(waiting);
  setCallStatus(role === 'guest' ? 'Connexion…' : call.ring ? `Appel de ${peerLabel()}… ça sonne.` : 'Appel ouvert. Envoyez le lien à votre proche.');
  call.timer = setInterval(pollCall, 1000);
}

// ---------- Appel par lien sans serveur BeyaBear’s : relais public PeerJS (open source, MIT) ----------
// L'identifiant de l'appel est celui de BeyaBear’s sur le relais ; le proche qui ouvre le lien l'appelle directement.
// Pour utiliser son propre relais PeerServer : définir window.BOOZZO_PEER = { host, port, path, secure }.

const RELAY_PREFIX = 'boozzo-';
// Serveurs utilisés pour relier les deux appareils. Quand deux réseaux ne peuvent pas se joindre directement
// (4G, certaines box), la vidéo doit passer par un serveur TURN. Ceux du relais public PeerJS sont un dépannage ;
// un serveur TURN à soi peut être enregistré sur l'appareil BeyaBear’s (Appels > Réglages du relais vidéo).
function relayIceServers() {
  const own = store.get('turn', null);
  return [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: ['turn:eu-0.turn.peerjs.com:3478', 'turn:us-0.turn.peerjs.com:3478', 'turn:eu-0.turn.peerjs.com:3478?transport=tcp', 'turn:us-0.turn.peerjs.com:3478?transport=tcp'],
      username: 'peerjs',
      credential: 'peerjsp',
    },
    ...(own?.urls ? [{ urls: own.urls.split(',').map((u) => u.trim()).filter(Boolean), username: own.username || '', credential: own.credential || '' }] : []),
  ];
}
// Diagnostic de l'appel en cours, affiché dans le panneau pour comprendre un blocage.
const diag = { relay: false, peer: false, ice: '', kinds: new Set(), path: '' };
function resetDiag() {
  Object.assign(diag, { relay: false, peer: false, ice: '', path: '' });
  diag.kinds.clear();
}
function diagText() {
  const video = { '': 'pas encore commencée', new: 'en préparation', checking: 'recherche d’un chemin…', connected: 'établie', completed: 'établie', disconnected: 'interrompue', failed: 'impossible', closed: 'fermée' }[diag.ice] || diag.ice;
  const path = { host: 'directe (même réseau)', srflx: 'directe (Internet)', prflx: 'directe (Internet)', relay: 'par le serveur de secours' }[diag.path];
  return [
    `Relais de mise en relation : ${diag.relay ? 'connecté' : 'non connecté'}`,
    `${guestMode ? 'BeyaBear’s' : 'Votre proche'} : ${diag.peer ? 'présent' : 'pas encore là'}`,
    `Liaison vidéo : ${video}${path ? ' · ' + path : ''}`,
    `Serveur de secours : ${diag.kinds.has('relay') ? 'disponible' : 'non disponible'}`,
  ];
}
let diagTimer = 0;
function diagChanged() {
  clearTimeout(diagTimer);
  diagTimer = setTimeout(() => {
    if (!call.peer) return;
    if (diag.ice === 'failed' && !call.connected)
      call.status = 'Les deux réseaux n’arrivent pas à se joindre. Nouvel essai…';
    if (state.screen === 'call') renderCall();
  }, 200);
}
// Suit l'état de la liaison vidéo d'une tentative d'appel.
function watchLink(media) {
  const pc = media.peerConnection;
  if (!pc) return;
  pc.addEventListener('icecandidate', (event) => {
    const kind = event.candidate?.type || event.candidate?.candidate.match(/ typ (\w+)/)?.[1];
    if (kind && !diag.kinds.has(kind)) (diag.kinds.add(kind), diagChanged());
  });
  pc.addEventListener('iceconnectionstatechange', async () => {
    if (call.media !== media) return;
    diag.ice = pc.iceConnectionState;
    if (['connected', 'completed'].includes(diag.ice)) {
      try {
        const stats = await pc.getStats();
        let pair = null;
        stats.forEach((report) => {
          if (report.type === 'transport' && report.selectedCandidatePairId) pair = stats.get(report.selectedCandidatePairId);
        });
        stats.forEach((report) => {
          if (!pair && report.type === 'candidate-pair' && report.nominated && report.state === 'succeeded') pair = report;
        });
        const kinds = pair ? [stats.get(pair.localCandidateId)?.candidateType, stats.get(pair.remoteCandidateId)?.candidateType] : [];
        diag.path = kinds.includes('relay') ? 'relay' : kinds.includes('srflx') || kinds.includes('prflx') ? 'srflx' : kinds[0] || '';
      } catch {}
    }
    diagChanged();
  });
}
function loadRelayLibrary() {
  return (loadRelayLibrary.loading ??= new Promise((resolve, reject) => {
    const script = Object.assign(document.createElement('script'), { src: 'peerjs.min.js', onload: resolve, onerror: reject });
    document.head.append(script);
  }));
}
async function startRelayCall(role, callId, run) {
  const id = role === 'eye' ? RELAY_PREFIX + uuid() : callId;
  let peer;
  try {
    await loadRelayLibrary();
    if (run !== call.run) return;
    peer = call.peer = new Peer(role === 'eye' ? id : undefined, { config: { iceServers: relayIceServers() }, ...(window.BOOZZO_PEER || {}) });
    await new Promise((resolve, reject) => {
      peer.once('open', resolve);
      peer.once('error', reject);
      setTimeout(() => reject(new Error('timeout')), 12000);
    });
    if (run !== call.run) return peer.destroy();
  } catch {
    if (run !== call.run) return;
    endCall(false, false);
    return setCallStatus('Impossible d’ouvrir l’appel. Vérifiez la connexion Internet et réessayez.');
  }
  Object.assign(call, { id, role, busy: false, connected: false, muted: false, ring: '' });
  resetDiag();
  // Une liaison qui tombe ne termine pas l'appel : seul un « bye » ou une absence prolongée le fait.
  // Chaque côté définit dans `dropped` comment il attend ou relance la liaison.
  let dropped = () => {};
  const attach = (media) => {
    call.media = media;
    media.on('stream', showRemote);
    watchLink(media);
    media.on('close', () => {
      if (call.media !== media || peer !== call.peer) return;
      call.media = null;
      call.connected = false;
      showLocalInEye('Reconnexion…');
      setCallStatus('La liaison a été interrompue. Reconnexion…');
      dropped();
    });
  };
  // Canal de messages : seul le « bye » du correspondant en appel compte (un second appareil peut ouvrir le lien).
  const listen = (conn) => {
    call.conns.push(conn);
    conn.on('open', () => ((diag.peer = true), diagChanged()));
    conn.on('data', (data) => {
      if (data !== 'bye' || conn.peer !== call.remote) return;
      endCall(false);
      toast('L’appel est terminé.');
    });
  };
  // Le téléphone met la page en veille dès qu'on passe sur WhatsApp : le lien avec le relais tombe.
  // On le rétablit dès que la page revient, et aussitôt qu'il tombe tant que la page est active.
  diag.relay = true;
  peer.on('open', () => ((diag.relay = true), diagChanged()));
  peer.on('disconnected', () => {
    diag.relay = false;
    diagChanged();
    if (peer === call.peer && !peer.destroyed) setTimeout(() => peer === call.peer && !peer.destroyed && peer.disconnected && peer.reconnect(), 500);
  });
  if (role === 'eye') {
    peer.on('connection', listen);
    // Après une coupure, on laisse trente secondes au proche pour rappeler avant de terminer l'appel.
    let giveUp = 0;
    dropped = () => {
      clearTimeout(giveUp);
      giveUp = setTimeout(() => {
        if (peer !== call.peer || call.media) return;
        endCall(false);
        setCallStatus('L’appel a été coupé.');
      }, 30000);
    };
    peer.on('call', (media) => {
      // Un second appareil qui ouvre le même lien ne doit pas casser l'appel en cours.
      if (call.connected && media.peer !== call.remote) return media.close();
      clearTimeout(giveUp);
      // Le proche rappelle tant qu'il n'a pas de réponse : la nouvelle tentative remplace l'ancienne.
      const previous = call.media;
      call.media = null;
      previous?.close();
      call.remote = media.peer;
      media.answer(call.local);
      attach(media);
    });
    if (kiosk) screen.innerHTML = qrSvg(callLink());
    else showLocalInEye('En attente de ton proche');
    setCallStatus('Appel ouvert. Envoyez le lien, puis revenez sur cette page.');
  } else {
    call.remote = id;
    // BeyaBear’s peut être momentanément en veille : on rappelle pendant deux minutes. Une tentative a vingt
    // secondes pour aboutir : la relancer plus tôt couperait une connexion en train de s'établir.
    let deadline = Date.now() + 120000;
    let failure = 'BeyaBear’s ne répond pas. Demandez un nouveau lien.';
    let retry = 0;
    dropped = () => {
      deadline = Date.now() + 30000;
      failure = 'L’appel a été coupé.';
      dial();
    };
    const dial = () => {
      clearTimeout(retry);
      if (peer !== call.peer || call.connected) return;
      if (Date.now() > deadline) {
        endCall(false);
        return setCallStatus(failure);
      }
      const previous = call.media;
      call.media = null;
      previous?.close();
      if (!peer.disconnected) {
        listen(peer.connect(id));
        attach(peer.call(id, call.local));
      }
      retry = setTimeout(dial, 20000);
    };
    peer.on('error', (error) => {
      if (peer !== call.peer || call.connected || error.type !== 'peer-unavailable') return;
      setCallStatus('En attente de BeyaBear’s… gardez cette page ouverte.');
      clearTimeout(retry);
      retry = setTimeout(dial, 3000);
    });
    showLocalInEye('Connexion…');
    setCallStatus('Connexion…');
    dial();
  }
}
// Au retour sur la page (après WhatsApp par exemple), rétablir le lien avec le relais sans attendre.
document.addEventListener('visibilitychange', () => {
  const peer = call.peer;
  if (!document.hidden && peer && !peer.destroyed && peer.disconnected) peer.reconnect();
  if (!document.hidden && call.role) keepAwake(true);
});

let polling = false;
async function pollCall() {
  if (polling || !call.role) return;
  polling = true;
  try {
    const { messages, cursor } = await api(`api/calls/${call.id}/signal?for=${call.role}&after=${encodeURIComponent(call.cursor)}`);
    call.cursor = cursor;
    for (const message of messages) await onSignal(message);
    if (call.pc || !call.role) return;
    call.polls++;
    // Tant que ça sonne : s'arrêter si le proche refuse ou ne répond pas.
    if (call.ring && call.polls % 3 === 0) {
      const contact = await api(`api/contacts/${call.ring}`);
      if (!call.role || contact.ring?.call === call.id) return;
      const name = call.name;
      const theirs = contact.ring && contact.ring.from !== myRingSide ? contact.ring.call : '';
      endCall(true);
      // L'autre côté appelait en même temps : rejoindre son appel au lieu de sonner dans le vide.
      if (theirs) {
        state.handled = theirs;
        return startCall('guest', { callId: theirs, contact: { name } });
      }
      setCallStatus(`${name || 'Votre proche'} n’a pas répondu.`);
    } else if (call.role === 'guest' && call.polls > 15) {
      const name = peerLabel();
      endCall(true);
      setCallStatus(`${name === 'ton proche' ? 'Votre proche' : name} n’est plus en ligne.`);
    }
  } catch (error) {
    if (error.status === 404) endCall(false);
  } finally {
    polling = false;
  }
}
// Empêche l'écran de se mettre en veille pendant un appel (la veille coupe la caméra et la liaison).
let wakeLock = null;
async function keepAwake(on) {
  try {
    if (on && !wakeLock && !document.hidden) {
      wakeLock = await navigator.wakeLock?.request('screen');
      wakeLock?.addEventListener('release', () => (wakeLock = null));
    } else if (!on && wakeLock) {
      const lock = wakeLock;
      wakeLock = null;
      await lock.release();
    }
  } catch {}
}
function showRemote(stream) {
  if (!$('video.remote', screen)) screen.innerHTML = '<video class="remote" autoplay playsinline></video>';
  const video = $('video.remote', screen);
  // Chaque piste (son, image) relance cet appel : ne pas recharger la vidéo pour le même flux.
  if (video.srcObject !== stream) video.srcObject = stream;
  video.play().catch(() => toast('Touchez l’œil pour activer le son.'));
  if (!call.connected) focusEye();
  call.connected = true;
  setCallStatus('En appel');
  keepAwake(true);
}
function newPeer() {
  call.pc?.close();
  const pc = (call.pc = new RTCPeerConnection({ iceServers: state.iceServers }));
  call.local.getTracks().forEach((track) => pc.addTrack(track, call.local));
  pc.ontrack = (event) => {
    if (pc === call.pc) showRemote(event.streams[0]);
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
    // Un second appareil qui ouvre le même lien ne doit pas casser l'appel en cours.
    if (call.pc && ['connecting', 'connected'].includes(call.pc.connectionState)) return;
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
  call.run++;
  const active = Boolean(call.role);
  if (!active && !call.busy && !call.local) return;
  clearInterval(call.timer);
  if (call.peer) {
    const peer = call.peer;
    try {
      if (active && sendBye) call.conns.forEach((conn) => conn.open && conn.send('bye'));
    } catch {}
    setTimeout(() => peer.destroy(), 300); // laisse partir le « bye »
  } else if (active && sendBye)
    fetch(`api/calls/${call.id}/signal`, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: call.role, type: 'bye' }),
    }).catch(() => {});
  if (call.ring) clearRing(call.ring, call.id);
  call.pc?.close();
  call.local?.getTracks().forEach((track) => track.stop());
  Object.assign(call, { id: '', role: '', pc: null, local: null, cursor: '', connected: false, muted: false, busy: false, ring: '', name: '', peer: null, conns: [], remote: '', media: null, wa: null, status: 'Appel terminé.' });
  screen.replaceChildren();
  keepAwake(false);
  if (show && state.screen === 'call') renderCall();
  if (state.wake) startWake();
}

// ---------- Test de la caméra et du micro avant un appel ----------

async function testDevices() {
  stopCamera();
  const result = (html) => $('#deviceResult') && ($('#deviceResult').innerHTML = html);
  result('<p class="muted">Ouverture de la caméra et du micro…</p>');
  let stream;
  try {
    stream = await camera({ video: { facingMode: 'user' }, audio: true });
  } catch (error) {
    sayInEye(cameraError(error), 'Test');
    return result(`<p class="error">${esc(cameraError(error))}</p>`);
  }
  if (state.screen !== 'call' || call.role || call.busy) return stream.getTracks().forEach((track) => track.stop());
  state.camera = stream;
  screen.innerHTML = '<video class="mirror" autoplay playsinline muted></video><span class="badge">Test de la caméra</span>';
  const video = $('video', screen);
  showStream(video, stream);
  // Niveau du micro, mesuré sur quelques secondes.
  unlockAudio();
  let heard = false;
  let analyser = null;
  try {
    analyser = audio.createAnalyser();
    audio.createMediaStreamSource(stream).connect(analyser);
  } catch {}
  const samples = new Uint8Array(analyser?.fftSize || 0);
  const report = () => {
    if (state.camera !== stream) return clearInterval(timer), clearInterval(meter);
    const image = video.videoWidth
      ? `<p>✅ Caméra : image reçue (${video.videoWidth} × ${video.videoHeight}). Vous devez vous voir dans l’œil.</p>`
      : '<p>⏳ Caméra : en attente de l’image…</p>';
    const sound = heard
      ? '<p>✅ Micro : votre voix est captée.</p>'
      : '<p>⏳ Micro : dites quelques mots…</p>';
    result(`${image}${sound}<div class="row"><button class="btn light" id="deviceStop" type="button">Arrêter le test</button></div>`);
  };
  const meter = setInterval(() => {
    if (!analyser || heard) return;
    analyser.getByteTimeDomainData(samples);
    if (Math.max(...samples.map((v) => Math.abs(v - 128))) > 6) heard = true;
  }, 80);
  const timer = setInterval(report, 500);
  report();
}
function stopDeviceTest() {
  stopCamera();
  screen.replaceChildren();
  renderCall();
}

// ---------- Proches et appels entrants ----------

// Le numéro WhatsApp reste sur cet appareil : il n'est pas envoyé au serveur.
async function addContact(name, phone = '') {
  try {
    const contact = await api('api/contacts', { device: deviceId, name });
    store.set('contacts', [...contacts(), { id: contact.id, name: contact.name, phone }]);
    state.newContact = contact;
  } catch {
    toast(state.server ? 'Impossible d’ajouter ce proche pour l’instant.' : DEMO_ONLY);
  }
  renderCall();
}
function forgetContact(id) {
  store.set('contacts', contacts().filter((c) => c.id !== id));
  if (state.newContact?.id === id) state.newContact = null;
  api(`api/contacts/${id}/remove`, { device: deviceId }).catch(() => {});
  renderCall();
}

// Un seul contexte audio, débloqué au premier toucher : les navigateurs refusent le son sans geste.
let audio = null;
function unlockAudio() {
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    audio.resume();
  } catch {}
}
document.addEventListener('pointerdown', unlockAudio);
// Même règle pour la voix de BeyaBear’s : sur iPhone, elle ne parle qu'après un premier toucher.
document.addEventListener('pointerdown', () => primeSpeech());
const pageTitle = document.title;
let ringer = 0;
function ringStart() {
  ringStop();
  unlockAudio();
  const note = (frequency, at) => {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, audio.currentTime + at);
    gain.gain.exponentialRampToValueAtTime(0.18, audio.currentTime + at + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + at + 0.45);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(audio.currentTime + at);
    oscillator.stop(audio.currentTime + at + 0.5);
  };
  const melody = () => {
    navigator.vibrate?.([300, 200, 300]);
    if (audio?.state === 'running') (note(659, 0), note(784, 0.25), note(988, 0.5));
  };
  ringer = setInterval(melody, 1800);
  melody();
  document.title = '📞 Appel · BeyaBear’s';
  if (audio?.state !== 'running') toast('Touchez l’écran pour entendre la sonnerie.');
}
function ringStop() {
  clearInterval(ringer);
  ringer = 0;
  document.title = pageTitle;
}
function showIncoming(incoming) {
  state.incoming = incoming;
  stopCamera();
  stopSpeaking();
  setScreen('call');
  focusEye();
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
  clearRing(incoming.contact, incoming.call);
  clearIncoming();
  call.status = 'Appel refusé.';
  renderCall();
}
// Surveille les appels entrants : ceux des proches côté BeyaBear’s, ceux de BeyaBear’s côté proche.
async function watchRings() {
  if (call.role || call.busy) return;
  try {
    let incoming = null;
    if (contactId) {
      const me = await api(`api/contacts/${contactId}`);
      const first = !state.me;
      state.me = me;
      if (me.ring?.from === 'eye') incoming = { contact: me.id, name: 'BeyaBear’s', call: me.ring.call };
      if (first && !incoming) renderCall();
    } else if (contacts().length) {
      incoming = (await api(`api/devices/${deviceId}/rings`)).rings[0] || null;
    }
    if (call.role || call.busy) return;
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

// En vue peluche, l'œil est trop petit pour viser une tuile : le premier toucher l'agrandit seulement.
document.addEventListener(
  'click',
  (event) => {
    if (kiosk || stage.classList.contains('eyeView') || !event.target.closest('#eye')) return;
    if (!['home', 'menu'].includes(state.screen)) return;
    event.preventDefault();
    event.stopPropagation();
    setView(true);
    if (state.screen === 'home') go('menu');
  },
  true,
);
document.addEventListener('click', (event) => {
  const button = event.target.closest('button, a');
  const data = button?.dataset || {};
  // Sur l'écran rond (sans panneau), l'icône Appels ouvre directement l'appel.
  if (data.go) return go(data.go, data.go === 'call' ? { start: kiosk } : undefined);
  if ('listen' in data) return listen();
  if ('page' in data) return openMenu({ page: state.menuPage + 1 });
  if (data.color) return setColor(data.color);
  if (data.story) return playStory(Number(data.story));
  if (data.torch) return (torch.mode = data.torch), renderTorch(), floodLight();
  if (data.unface) return store.set('faces', faces().filter((_, i) => i !== Number(data.unface))), renderFaces();
  if (data.esimWho || data.esimOffer) {
    store.set('esim', { ...store.get('esim', {}), ...(data.esimWho ? { who: data.esimWho } : { offer: data.esimOffer }) });
    return openEsim();
  }
  if (data.call) return data.call === 'accept' ? acceptIncoming() : declineIncoming();
  if (data.contact) return startCall('eye', { contact: contacts().find((c) => c.id === data.contact) });
  if (data.link) return (state.newContact = contacts().find((c) => c.id === data.link)), renderCall();
  if (data.forget) return forgetContact(data.forget);
  if (data.wa) return startCall('eye', { wa: contacts().find((c) => c.id === data.wa) });
  if (data.share) {
    if (navigator.share) return navigator.share({ title: 'BeyaBear’s', url: data.share }).catch(() => {});
    return navigator.clipboard?.writeText(data.share).then(
      () => toast('Lien copié.'),
      () => toast(data.share),
    );
  }
  if (data.video) return playVideo(state.screen, data.video);
  if (data.unfav) {
    store.set(videoKey(state.screen), store.get(videoKey(state.screen), []).filter((_, i) => i !== Number(data.unfav)));
    return openVideo(state.screen);
  }
  if (data.shot) return showShot(store.get('shots', [])[Number(data.shot)]), renderPhoto();
  switch (button?.id) {
    case 'viewToggle':
      return setView(!stage.classList.contains('eyeView'));
    case 'snap':
      return snap();
    case 'quiet':
      stopSpeaking();
      return state.screen === 'story' ? (renderStories(), sayInEye('Choisis une histoire.', 'Histoire')) : undefined;
    case 'newStory':
      return ask('Raconte-moi une courte histoire douce.');
    case 'torchEye':
      torch.flood = false;
      return floodLight();
    case 'torchFull':
      torch.flood = true;
      return floodLight();
    case 'locate':
      return useMyPosition();
    case 'mapToggle':
      weather.view = weather.view === 'map' ? 'card' : 'map';
      focusEye();
      return renderWeather();
    case 'deviceTest':
      return testDevices();
    case 'deviceStop':
      return stopDeviceTest();
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
      return startCall('eye', { contact: { id: contactId, name: 'BeyaBear’s' } });
  }
  // Toucher l'œil pendant un appel : relancer le son si le navigateur l'avait bloqué.
  if (!button && call.connected && event.target.closest('#eye')) return $('video.remote', screen)?.play().catch(() => {});
  // Toucher l'iris : ouvrir le menu des applications.
  if (!button && event.target.closest('#eye') && state.screen === 'home') go('menu');
});
document.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  if (form.id === 'chatForm') {
    const text = form.text.value.trim();
    primeSpeech();
    if (text) ask(text);
  }
  if (form.id === 'turnForm') {
    const turn = { urls: form.urls.value.trim(), username: form.username.value.trim(), credential: form.credential.value };
    store.set('turn', turn.urls ? turn : null);
    toast(turn.urls ? 'Relais vidéo enregistré.' : 'Relais vidéo retiré.');
  }
  if (form.id === 'placeForm') {
    const city = form.city.value.trim();
    if (city) setPlace(city);
  }
  if (form.id === 'searchForm') {
    const q = form.q.value.trim();
    if (q) searchYoutube(q);
  }
  if (form.id === 'faceForm') {
    const name = form.name.value.trim();
    if (name) enrollFace(name);
  }
  if (form.id === 'contactForm') {
    const name = form.name.value.trim();
    if (name) addContact(name, form.phone.value.replace(/\D/g, '').slice(0, 15));
  }
  if (form.id === 'videoForm' && VIDEO[state.screen]) {
    const app = state.screen;
    const id = videoId(app, form.link.value);
    if (!id) return ($('#videoError').textContent = VIDEO[app].error);
    const name = form.name.value.trim();
    if (name) store.set(videoKey(app), [{ id, name }, ...store.get(videoKey(app), []).filter((v) => v.id !== id)].slice(0, 12));
    openVideo(app);
    playVideo(app, id);
  }
});
document.addEventListener('change', (event) => {
  if (event.target.id !== 'wake') return;
  state.wake = event.target.checked;
  if (state.wake) startWake();
  else stopRecognizer();
});
eye.addEventListener('keydown', (event) => {
  if (event.target === eye && (event.key === 'Enter' || event.key === ' ')) (event.preventDefault(), eye.click());
});
window.addEventListener('pagehide', () => {
  endCall(true, false);
  stopCamera();
});

// ---------- Démarrage ----------

// Le serveur BeyaBear’s répond-il ? Sinon la page tourne seule (démonstration) et les appels passent par le relais.
const serverReady = api('api/config')
  .then((config) => {
    state.assistant = Boolean(config.assistant);
    state.youtube = Boolean(config.youtube);
    if (Array.isArray(config.iceServers)) state.iceServers = config.iceServers;
    if (state.screen === 'chat') renderChat();
  })
  .catch(() => {
    state.server = false;
  });

applyColor();
document.body.classList.toggle('kiosk', kiosk);
document.body.classList.toggle('guest', guestMode);
if (guestMode) $('.brand').href = location.href;
setView(kiosk);
if (guestMode) {
  setScreen('call');
  renderCall();
  // Le lien d'appel suffit : l'appel démarre dès l'ouverture de la page.
  if (guestCallId) startCall('guest', { callId: guestCallId });
} else {
  // L'œil s'ouvre sur ses applications ; le bouton maison du menu ramène à l'iris.
  go('menu');
}
if (!guestCallId) {
  watchRings();
  setInterval(watchRings, 3000);
}
