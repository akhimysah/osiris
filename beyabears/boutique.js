// Beya Store : comme sur un téléphone neuf, on crée d'abord le compte (adresse e-mail du parent),
// puis on télécharge les applications voulues. Seules les applications installées apparaissent au menu.
// Chargé avant app.js : ses fonctions n'utilisent store, screen, panel, APPS… qu'au moment de l'appel.
// Démonstration : le compte et la liste d'applications restent sur l'appareil, rien n'est envoyé.

const PREINSTALLED = ['call', 'chat', 'clock', 'story', 'photo', 'secure', 'store'];
const APP_NOTES = {
  youtube: 'Vidéos et dessins animés choisis par les parents.', tiktok: 'Vidéos courtes, sous contrôle parental.', games: 'Cinq jeux à toucher dans l’œil.',
  emo: 'L’œil exprime ses émotions.', core: 'Le cœur énergétique à recharger en jouant.', link: 'Envoyer un cœur ou un câlin à un proche.',
  memory: 'Les souvenirs gardés par la peluche.', dream: 'Veilleuses et ambiance pour la nuit.', holo: 'Le socle : recharge, lumière et enceinte.',
  locate: 'Savoir où est la peluche.', music: 'Écouter sa musique.', weather: 'La météo du jour dans l’œil.', torch: 'L’œil éclaire comme une lampe.',
  face: 'Reconnaître les proches et les saluer.', phone: 'Afficher l’écran du téléphone dans l’œil.', iris: 'Changer la couleur de l’iris.', esim: 'Le forfait pour rester connecté partout.',
  whatsapp: 'Ouvrir WhatsApp pour appeler ou écrire.', edu: 'Calcul et couleurs : apprendre en s’amusant, une étoile par bonne réponse.',
};
const appsOn = () => { const list = store.get('apps'); return Array.isArray(list) ? [...new Set([...list, 'secure', 'store'])] : PREINSTALLED; };
const appOn = (id) => appsOn().includes(id);
const account = () => store.get('account', null);
const storeIcon = (id) => { const a = APPS.find(([x]) => x === id), e = EXTERNAL.find(([x]) => x === id); return a ? `<i class="${a[2]}">${ICON[id]}</i>` : e ? `<i class="${e[2]}">${ICON[e[3]]}</i>` : `<i class="c-store">${ICON.store}</i>`; };

function storeEye(html) { screen.innerHTML = `<div class="storeEye">${html}</div>`; }
const APP_SHOTS = { edu: 3, music: 2, youtube: 1 }; // aperçus illustrés (dossier shots/)
const STORE_CATS = [['tous', 'Tout'], ['apprendre', 'Apprendre'], ['jouer', 'Jouer'], ['voir', 'Regarder'], ['lien', 'Partager'], ['nuit', 'Nuit'], ['outil', 'Outils']];
const APP_CAT = { edu: 'apprendre', games: 'jouer', emo: 'jouer', core: 'jouer', youtube: 'voir', tiktok: 'voir', phone: 'voir', music: 'voir', link: 'lien', whatsapp: 'lien', face: 'lien', memory: 'lien', dream: 'nuit', holo: 'nuit', torch: 'nuit', weather: 'outil', iris: 'outil', esim: 'outil', locate: 'outil' };
const STORE_STARS = [['edu', 'Apprendre en s’amusant', '#ff9d3d', '#e0631a'], ['games', 'Cinq jeux, zéro ennui', '#ff8a3d', '#ff4d6d'], ['dream', 'Des nuits toutes douces', '#5b62c9', '#14224f'], ['youtube', 'Tes dessins animés préférés', '#ff5d5d', '#b3123a'], ['emo', 'Un œil plein d’émotions', '#ffb62e', '#ff6b8b']];
const storeApps = () => [...APPS, ...EXTERNAL].map(([id, label]) => [id, label]).filter(([id]) => !PREINSTALLED.includes(id));

// Petit « pop » joué au toucher (le navigateur l'autorise après un geste).
function pop(freq = 660, ms = 120) {
  try {
    const A = pop.ctx || (pop.ctx = new (window.AudioContext || window.webkitAudioContext)());
    const o = A.createOscillator(), g = A.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(freq, A.currentTime); o.frequency.exponentialRampToValueAtTime(freq * 1.6, A.currentTime + ms / 1000);
    g.gain.setValueAtTime(0.06, A.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, A.currentTime + ms / 1000);
    o.connect(g).connect(A.destination); o.start(); o.stop(A.currentTime + ms / 1000);
  } catch {}
}
// Confettis lancés depuis un élément.
function confetti(el, n = 16) {
  if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = document.createElement('div');
  box.className = 'confetti';
  const colors = ['#ff5d5d', '#ffb62e', '#58d36b', '#4aa8f0', '#9b6bff', '#ff7ab8'];
  box.innerHTML = Array.from({ length: n }, (_, i) => `<u style="--x:${Math.round(Math.cos((i / n) * 6.283) * (50 + Math.random() * 60))}px;--y:${Math.round(Math.sin((i / n) * 6.283) * (40 + Math.random() * 60) - 30)}px;--r:${Math.round(Math.random() * 540)}deg;background:${colors[i % 6]}"></u>`).join('');
  el.append(box);
  setTimeout(() => box.remove(), 1300);
}

function storeCount() {
  const all = storeApps(), on = appsOn(), n = all.filter(([id]) => on.includes(id)).length, bar = panel.querySelector('.storeBar');
  if (!bar) return;
  bar.style.setProperty('--p', Math.round((n / all.length) * 100));
  bar.querySelector('b').textContent = `${n} / ${all.length}`;
}
function storeStar(k) {
  const box = panel.querySelector('.storeStar');
  if (!box) return;
  const [id, line, c1, c2] = STORE_STARS[k % STORE_STARS.length], label = (storeApps().find(([x]) => x === id) || [])[1] || '';
  box.style.setProperty('--a', c1); box.style.setProperty('--b', c2);
  box.dataset.k = k % STORE_STARS.length;
  box.innerHTML = `<div class="in">${storeIcon(id)}<div><small>À la une</small><b>${label}</b><span>${line}</span></div>${appOn(id) ? `<button type="button" class="open" data-go="${id}">Ouvrir</button>` : `<button type="button" class="get" data-get="${id}">Installer</button>`}</div><div class="dots">${STORE_STARS.map((_, i) => `<button type="button" data-star="${i}" class="${i === k % STORE_STARS.length ? 'on' : ''}" aria-label="${i + 1}"></button>`).join('')}</div>`;
}
const storeCard = ([id, label], i, on) => `<li data-app="${id}" data-cat="${APP_CAT[id] || 'outil'}" data-q="${esc((label + ' ' + (APP_NOTES[id] || '')).toLowerCase())}" class="${on.includes(id) ? 'on' : ''}" style="--i:${i}"><button type="button" class="tile" data-detail="${id}" aria-label="${label} : voir la fiche">${storeIcon(id)}<b>${label}</b></button>
  <div class="act">${on.includes(id) ? (EXTERNAL.some(([x]) => x === id) ? '<em>Installée ✓</em>' : `<button type="button" class="open" data-go="${id}">Ouvrir</button>`) : `<button type="button" class="get" data-get="${id}">Installer</button>`}</div></li>`;
const catLabel = (id) => (STORE_CATS.find(([c]) => c === (APP_CAT[id] || 'outil')) || [])[1] || '';
// Fiche d'une application : grande icône, description, essai dans l'œil, applications du même rayon.
function storeDetail(id) {
  const app = storeApps().find(([x]) => x === id);
  if (!app) return openStore();
  clearInterval(openStore.timer);
  const on = appsOn().includes(id), ext = EXTERNAL.some(([x]) => x === id), near = storeApps().filter(([x]) => x !== id && (APP_CAT[x] || 'outil') === (APP_CAT[id] || 'outil')).slice(0, 3);
  storeEye(`${storeIcon(id)}<b>${app[1]}</b><small>${on ? 'Installée' : catLabel(id)}</small>`);
  panel.innerHTML = `<button class="back" data-go="store" type="button">‹ Beya Store</button>
    <div class="appSheet" data-app="${id}"><div class="appIcon"><img src="${APP_SHOTS[id] ? `shots/${id}-icone` : `m/${id === 'music' ? 'spotify' : id}`}.webp" alt="" width="220" height="220" onerror="this.remove()"></div>
      <h2>${app[1]}</h2><p class="by">BeyaBear’s</p>
      <div class="tags"><span>${catLabel(id)}</span><span>Gratuit dans la démo</span></div>
      <div class="act">${on ? (ext ? '<em>Installée ✓</em>' : `<button type="button" class="open big" data-go="${id}">Ouvrir</button>`) : `<button type="button" class="get big" data-get="${id}">Installer</button>`}${on ? `<button type="button" class="linkBtn" data-drop="${id}">Retirer</button>` : ''}</div>
      ${ext ? '' : `<button type="button" class="try" data-go="${id}">Essayer dans l’œil</button>`}
      ${APP_SHOTS[id] ? `<h3 class="sub">Aperçu</h3><div class="shots">${Array.from({ length: APP_SHOTS[id] }, (_, i) => `<img src="shots/${id}-${i + 1}.webp" alt="" width="190" height="222" loading="lazy" style="--i:${i}">`).join('')}</div>` : ''}
      <h3 class="sub">Description</h3><p>${APP_NOTES[id] || ''}</p>
      ${near.length ? `<h3 class="sub">Applications <em>similaires</em></h3><ul class="storeGrid">${near.map((a, i) => storeCard(a, i, appsOn())).join('')}</ul>` : ''}</div>`;
}
function openProfile() {
  const me = account();
  if (!me) return openStore();
  clearInterval(openStore.timer);
  const mine = [...APPS, ...EXTERNAL].filter(([id]) => appOn(id) && id !== 'store' && id !== 'secure');
  storeEye(`<i class="c-masc"><img class="mascImg" src="store-icone.webp" alt=""></i><b>${me.child ? esc(me.child) : 'Profil'}</b><small>${mine.length} applications</small>`);
  panel.innerHTML = `${backButton}<span class="pill">Profil</span><h2>${me.child ? esc(me.child) : 'Mon compte'}</h2>
    <p class="acct">${esc(me.email)}</p>
    <h3 class="sub">Mes <em>applications</em></h3>
    <div class="mine">${mine.map(([id, label]) => `<button type="button" data-go="${id}" aria-label="${label}">${storeIcon(id)}</button>`).join('')}</div>
    <div class="row wrap"><button type="button" class="btn" data-go="store">Ouvrir le Beya Store</button><button type="button" class="btn light" data-go="secure">Contrôle parental</button><button type="button" class="btn light" data-signout>Changer de compte</button></div>
    <p class="notice">Démonstration : l’adresse reste sur cet appareil et rien n’est envoyé. Dans la version finale, le parent crée le compte et valide chaque téléchargement.</p>`;
}
function openStore() {
  store.set('welcomed', true);
  clearInterval(openStore.timer);
  const me = account(), on = appsOn();
  if (!me) {
    storeEye(`<i class="c-masc"><img class="mascImg" src="store-icone.webp" alt=""></i><b>Bienvenue !</b><small>Créez votre compte pour commencer.</small>`);
    panel.innerHTML = `${backButton}<span class="pill">Première mise en route</span><h2>Votre compte BeyaBear’s</h2>
      <div class="steps"><i class="on">1</i><u></u><i>2</i><u></u><i>3</i></div>
      <p>Comme sur un téléphone neuf : un compte, puis vous téléchargez les applications que vous voulez.</p>
      <form class="account" id="accountForm">
        <label>Adresse e-mail du parent<input name="email" type="email" maxlength="80" required placeholder="prenom@exemple.fr" aria-label="Adresse e-mail du parent" autocomplete="email" value="${esc(store.get('email', ''))}"></label>
        <label>Prénom de l’enfant <span class="muted">(facultatif)</span><input name="child" maxlength="30" placeholder="Prénom" aria-label="Prénom de l’enfant" autocomplete="off"></label>
        <label class="check"><input type="checkbox" name="ok" required> Je suis le parent ou le responsable de l’enfant.</label>
        <button class="btn">Créer le compte</button>
      </form>
      <p class="notice">Démonstration : l’adresse reste sur cet appareil et rien n’est envoyé. Dans la version finale, le parent crée le compte et valide chaque téléchargement.</p>`;
    return;
  }
  const all = storeApps();
  storeEye(`<i class="c-masc"><img class="mascImg" src="store-icone.webp" alt=""></i><b>Beya Store</b><small>Choisis une application.</small>`);
  panel.innerHTML = `${backButton}
    <div class="storeHead"><img src="store.webp" alt="" width="120" height="120"><div><h2>Beya Store</h2><label class="search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg><input id="storeSearch" type="search" placeholder="Rechercher une appli…" aria-label="Rechercher une application" autocomplete="off"></label></div></div>
    <div class="storeStar"></div>
    <div class="storeBar"><span>Ma collection</span><b></b><i></i></div>
    <div class="chips">${STORE_CATS.map(([id, label], i) => `<button type="button" data-cat="${id}" class="${i ? '' : 'on'}">${label}</button>`).join('')}</div>
    <ul class="storeGrid">${all.map((app, i) => storeCard(app, i, on)).join('')}</ul>
    <p class="muted">Déjà sur la peluche : Appels, Assistant, Heure, Histoires, Photo et Sécurité.</p>
    <p class="notice">Démonstration : toutes les applications sont gratuites ici et rien n’est réellement téléchargé.</p>`;
  storeStar(0); storeCount();
  // La une change toute seule tant que l'écran est ouvert.
  openStore.timer = setInterval(() => {
    const box = panel.querySelector('.storeStar');
    if (state.screen !== 'store' || !box) return clearInterval(openStore.timer);
    if (!box.matches(':hover') && !panel.querySelector('.storeGrid .loading')) storeStar(Number(box.dataset.k || 0) + 1);
  }, 4200);
}
// Téléchargement simulé : le bouton se remplit, un anneau tourne dans l'œil, puis confettis.
function storeGet(id) {
  const app = [...APPS, ...EXTERNAL].find(([x]) => x === id);
  if (!app || !account()) return openStore();
  if (typeof secAsk === 'function' && secAsk(id)) return;
  const card = panel.querySelector(`.storeGrid [data-app="${id}"]`);
  if (card?.classList.contains('loading')) return;
  pop(520);
  card?.classList.add('loading');
  panel.querySelectorAll(`[data-get="${id}"]`).forEach((b) => { b.disabled = true; b.classList.add('fill'); b.textContent = 'Téléchargement…'; });
  storeEye(`<div class="dl"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44"/><circle class="run" cx="50" cy="50" r="44" pathLength="100" transform="rotate(-90 50 50)"/></svg>${storeIcon(id)}</div><b>${app[1]}</b><small>Téléchargement…</small>`);
  setTimeout(() => {
    store.set('apps', [...new Set([...appsOn(), id])]);
    if (state.screen !== 'store') return;
    if (panel.querySelector(`.appSheet[data-app="${id}"]`)) { storeDetail(id); confetti(panel.querySelector('.appIcon'), 20); }
    const now = panel.querySelector(`.storeGrid [data-app="${id}"]`);
    if (now) {
      now.outerHTML = storeCard(storeApps().find(([x]) => x === id), 0, appsOn());
      const fresh = panel.querySelector(`.storeGrid [data-app="${id}"]`);
      fresh.classList.add('won');
      confetti(fresh);
    }
    pop(880, 220);
    storeCount();
    const star = panel.querySelector('.storeStar');
    if (star) storeStar(Number(star.dataset.k || 0));
    storeEye(`${storeIcon(id)}<b>${app[1]}</b><small>Installée</small>${EXTERNAL.some(([x]) => x === id) ? '' : `<button type="button" class="open" data-go="${id}">Ouvrir</button>`}`);
    confetti(screen.querySelector('.storeEye'), 22);
  }, 1600);
}
document.addEventListener('submit', (event) => {
  if (event.target.id !== 'accountForm') return;
  event.preventDefault();
  const email = event.target.email.value.trim(), child = event.target.child.value.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast('Adresse e-mail incomplète.');
  store.set('account', { email, child });
  store.set('email', email);
  pop(880, 220);
  openStore();
  confetti(panel.querySelector('h2'), 20);
});
document.addEventListener('click', (event) => {
  const data = event.target.closest && event.target.closest('button')?.dataset;
  if (!data) return;
  if (data.get) return storeGet(data.get);
  if (data.drop) return store.set('apps', appsOn().filter((id) => id !== data.drop)), panel.querySelector('.appSheet') ? storeDetail(data.drop) : openStore();
  if (data.detail) return pop(620, 70), storeDetail(data.detail);
  if (data.discover) return pop(620, 70), go('store'), storeDetail(data.discover), window.scrollTo({ top: 0, behavior: 'smooth' });
  if (data.nav === 'profile') return go('store'), openProfile();
  if (data.nav === 'apps') return (homeTab = 'apps'), go('menu'), setView(false), panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (data.go === 'menu' || data.go === 'home') homeTab = 'home';
  if (data.clip) {
    pop(640, 70);
    panel.querySelectorAll('[data-clip]').forEach((x) => x.classList.toggle('on', x.dataset.clip === data.clip));
    const v = panel.querySelector('.bearEye video');
    if (v) { v.poster = `clips/${data.clip}.jpg`; v.src = `clips/${data.clip}.mp4`; v.play().catch(() => {}); }
    return;
  }
  if ('clipBig' in data) {
    const v = panel.querySelector('.bearEye video');
    if (!v) return;
    screen.innerHTML = `<video class="clipBig" muted loop playsinline autoplay src="${v.getAttribute('src')}" poster="${v.getAttribute('poster')}"></video>`;
    return focusEye();
  }
  if ('signout' in data) return store.set('account', null), openStore();
  if (data.star) return storeStar(Number(data.star));
  if (data.cat && panel.querySelector('.chips')) {
    pop(700, 60);
    panel.querySelectorAll('.chips button').forEach((b) => b.classList.toggle('on', b.dataset.cat === data.cat));
    let i = 0;
    panel.querySelectorAll('.storeGrid li').forEach((li) => { const show = data.cat === 'tous' || li.dataset.cat === data.cat; li.hidden = !show; if (show) { li.style.setProperty('--i', i++); li.classList.remove('in'); void li.offsetWidth; li.classList.add('in'); } });
  }
});

// ---------- Accueil vivant : la mascotte répond quand on la touche ----------
const POKE_FACES = ['joie', 'rire', 'amour', 'surprise', 'clin', 'fete', 'musique'];
const POKE_LINES = ['Hi hi, ça chatouille !', 'Encore, encore !', 'Tu veux une histoire ?', 'On joue ensemble ?', 'Je t’adore !', 'Oh ! Tu m’as surpris !', 'Fais-moi un câlin !', 'On appelle quelqu’un ?'];
let pokeN = 0;
function homeHello() {
  const h = new Date().getHours(), me = account();
  return `<span>${h < 5 ? 'Bonne nuit' : h < 12 ? 'Bonjour' : h < 18 ? 'Coucou' : h < 22 ? 'Bonsoir' : 'Bonne nuit'}</span>${me && me.child ? ` <em>${esc(me.child)}</em>` : ''} !`;
}
// Idées du moment : l'ordre suit l'heure de la journée.
function homeIdeas() {
  const h = new Date().getHours();
  const ideas = { story: ['story', 'L’histoire du moment', 'Un décor animé à toucher', '#5b62c9', '#272c78'], call: ['call', 'Un bisou à distance', 'Appelle quelqu’un que tu aimes', '#34c98a', '#128a63'], photo: ['photo', 'Souris !', 'Prends une photo rigolote', '#ffb62e', '#ff7a3d'], chat: ['chat', 'Pose-moi une question', 'Je t’écoute', '#4aa8f0', '#2e63e0'], store: ['store', 'Nouvelles applications', 'Jeux, veilleuses, vidéos…', '#9b6bff', '#5b3bd0'] };
  const order = h >= 18 || h < 6 ? ['story', 'call', 'store', 'chat', 'photo'] : h < 12 ? ['chat', 'photo', 'story', 'store', 'call'] : ['photo', 'store', 'call', 'story', 'chat'];
  return `<div class="ideas">${order.map((k) => ideas[k]).map(([id, t, s, a, b2], i) => `<button type="button" data-go="${id}" style="--a:${a};--b:${b2};--i:${i}">${storeIcon(id)}<b>${t}</b><span>${s}</span></button>`).join('')}</div>`;
}
// Onglet Apps : mes applications, puis celles qui restent à installer. L'accueil, lui, ne les répète pas.
let homeTab = 'home';
function renderApps() {
  panel.innerHTML = `<span class="pill">Apps</span><h2 class="appsPage">Mes <em>applications</em></h2>
    <div class="apps lively">${APPS.filter(([id]) => appOn(id) && id !== 'store').map(([id, label, color], i) => `<button data-go="${id}" type="button" style="--i:${i}"><i class="${color}">${ICON[id]}</i>${label}</button>`).join('')}${EXTERNAL.filter(([id]) => appOn(id)).map((app) => externalTile(app)).join('')}<button data-go="store" type="button" class="more" style="--i:9"><i>+</i>Ajouter</button></div>
    ${homeMore()}`;
}
// Accueil : chiffres du jour, histoires, humeurs et porte du Store.
// Vidéos des mascottes, recadrées pour l'œil rond : on les teste directement dans la peluche.
const HOME_CLIPS = [['ciel', 'Pluie d’oursons'], ['ballon', 'Montgolfière'], ['messages', 'Messages'], ['souvenirs', 'Souvenirs'], ['photo', 'Photo'], ['internet', 'Internet'], ['localisation', 'Localisation']];
function homeExtras() {
  const rest = storeApps().filter(([id]) => !appOn(id)).length, mine = [...APPS, ...EXTERNAL].filter(([id]) => appOn(id) && id !== 'store').length;
  const mins = typeof secUsed === 'function' ? Math.round(secUsed() / 60) : 0, stars = typeof eduStars === 'function' ? eduStars() : 0;
  return `<div class="statRow"><button type="button" data-go="edu"><b>★ ${stars}</b><span>étoiles</span></button><button type="button" data-nav="apps"><b>${mine}</b><span>applis</span></button><button type="button" data-go="secure"><b>${mins}</b><span>min d’écran</span></button></div>
    <h3 class="sub">Histoires <em>du soir</em></h3>
    <div class="storyRow">${STORIES.slice(0, 3).map((story, i) => `<button type="button" data-story="${i}" style="--i:${i}">${storyThumb(i)}<b>${story.title}</b></button>`).join('')}</div>
    <h3 class="sub">Regarde <em>dans mon œil</em></h3>
    <div class="tryBear"><div class="bearBox"><img src="emo/noah-toucher.webp" alt="Noah, la peluche aviateur BeyaBear’s" width="550" height="760" loading="lazy"><button type="button" class="bearEye" data-clip-big aria-label="Voir cette vidéo dans le grand œil"><video muted loop playsinline autoplay preload="metadata" poster="clips/${HOME_CLIPS[0][0]}.jpg" src="clips/${HOME_CLIPS[0][0]}.mp4"></video></button></div>
      <div class="chips">${HOME_CLIPS.map(([id, label], k) => `<button type="button" data-clip="${id}" class="${k ? '' : 'on'}">${label}</button>`).join('')}</div>
      <p class="muted">Choisissez une vidéo : elle joue dans l’œil de la peluche, comme sur la vraie. Touchez l’œil pour la voir en grand.</p></div>
    <button type="button" class="storeBanner" data-go="store"><img src="store.webp" alt="" width="96" height="96" loading="lazy"><span><b>Beya Store</b><small><i>${rest}</i> applications à découvrir</small></span><em>›</em></button>`;
}
// Les applications pas encore installées : un toucher ouvre leur fiche.
function homeMore() {
  const rest = storeApps().filter(([id]) => !appOn(id)).sort((x, y) => (y[0] === 'edu') - (x[0] === 'edu')); // Éducation en tête
  if (!rest.length) return '';
  return `<h3 class="sub">D’autres <em>applications</em></h3>
    <div class="apps lively discover">${rest.map(([id, label], i) => `<button data-discover="${id}" type="button" style="--i:${i}" aria-label="${label} : voir la fiche">${storeIcon(id)}<u aria-hidden="true">+</u>${label}</button>`).join('')}</div>
    <p class="muted">Touchez une application pour voir sa fiche et l’installer.</p>`;
}
const homeHero = () => `<div class="hero"><button type="button" class="heroFace" data-poke aria-label="Toucher BeyaBear’s"><img src="emo/joie.webp" alt="" width="120" height="120"></button>
  <div><h2 class="hello">${homeHello()}</h2><p class="bubble" id="bubble">Touche-moi, je réagis !</p></div></div>`;
document.addEventListener('click', (event) => {
  const face = event.target.closest && event.target.closest('[data-poke]');
  if (!face) return;
  pokeN++;
  face.querySelector('img').src = `emo/${POKE_FACES[pokeN % POKE_FACES.length]}.webp`;
  const bubble = document.getElementById('bubble');
  if (bubble) { bubble.textContent = POKE_LINES[pokeN % POKE_LINES.length]; bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop'); }
  face.classList.remove('boing'); void face.offsetWidth; face.classList.add('boing');
  pop(500 + (pokeN % 5) * 90, 110);
  if (pokeN % 5 === 0) confetti(face, 18);
});

// Recherche dans le store : filtre les cartes à mesure qu'on écrit.
document.addEventListener('input', (event) => {
  if (event.target.id !== 'storeSearch') return;
  const q = event.target.value.trim().toLowerCase();
  panel.querySelectorAll('.chips button').forEach((b2, i) => b2.classList.toggle('on', !i));
  panel.querySelectorAll('.storeGrid li').forEach((li) => { li.hidden = Boolean(q) && !li.dataset.q.includes(q); });
});

// Barre du bas, comme sur un téléphone : Accueil, Apps, Store, Profil.
const tabbar = document.createElement('nav');
tabbar.className = 'tabbar';
tabbar.setAttribute('aria-label', 'Navigation de l’application');
tabbar.innerHTML = `<button type="button" data-go="menu" data-tab="home"><svg viewBox="0 0 24 24"><path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/></svg>Accueil</button>
  <button type="button" data-nav="apps" data-tab="apps"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/></svg>Apps</button>
  <button type="button" data-go="store" data-tab="store"><svg viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6z"/><path d="M9 8a3 3 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="2"/></svg>Store</button>
  <button type="button" data-nav="profile" data-tab="profile"><svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0z"/></svg>Profil</button>`;
document.body.append(tabbar);
setInterval(() => {
  if (typeof state === 'undefined') return;
  const tab = state.screen === 'store' ? (panel.querySelector('.mine') ? 'profile' : 'store') : ['home', 'menu'].includes(state.screen) && !panel.querySelector('.appsPage') ? 'home' : 'apps';
  tabbar.querySelectorAll('button').forEach((b2) => b2.classList.toggle('on', b2.dataset.tab === tab));
}, 400);
