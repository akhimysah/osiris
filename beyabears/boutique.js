// Beya Store : comme sur un téléphone neuf, on crée d'abord le compte (adresse e-mail du parent),
// puis on télécharge les applications voulues. Seules les applications installées apparaissent au menu.
// Chargé avant app.js : ses fonctions n'utilisent store, screen, panel, APPS… qu'au moment de l'appel.
// Démonstration : le compte et la liste d'applications restent sur l'appareil, rien n'est envoyé.

const PREINSTALLED = ['call', 'chat', 'clock', 'story', 'photo', 'store'];
const APP_NOTES = {
  youtube: 'Vidéos et dessins animés choisis par les parents.', tiktok: 'Vidéos courtes, sous contrôle parental.', games: 'Cinq jeux à toucher dans l’œil.',
  emo: 'L’œil exprime ses émotions.', core: 'Le cœur énergétique à recharger en jouant.', link: 'Envoyer un cœur ou un câlin à un proche.',
  memory: 'Les souvenirs gardés par la peluche.', dream: 'Veilleuses et ambiance pour la nuit.', holo: 'Le socle : recharge, lumière et enceinte.',
  locate: 'Savoir où est la peluche.', music: 'Écouter sa musique.', weather: 'La météo du jour dans l’œil.', torch: 'L’œil éclaire comme une lampe.',
  face: 'Reconnaître les proches et les saluer.', phone: 'Afficher l’écran du téléphone dans l’œil.', iris: 'Changer la couleur de l’iris.', esim: 'Le forfait pour rester connecté partout.',
  whatsapp: 'Ouvrir WhatsApp pour appeler ou écrire.',
};
const appsOn = () => { const list = store.get('apps'); return Array.isArray(list) ? [...new Set([...list, 'store'])] : PREINSTALLED; };
const appOn = (id) => appsOn().includes(id);
const account = () => store.get('account', null);
const storeIcon = (id) => { const a = APPS.find(([x]) => x === id), e = EXTERNAL.find(([x]) => x === id); return a ? `<i class="${a[2]}">${ICON[id]}</i>` : e ? `<i class="${e[2]}">${ICON[e[3]]}</i>` : `<i class="c-store">${ICON.store}</i>`; };

function storeEye(html) { screen.innerHTML = `<div class="storeEye">${html}</div>`; }
const STORE_CATS = [['tous', 'Tout'], ['jouer', 'Jouer'], ['voir', 'Regarder'], ['lien', 'Partager'], ['nuit', 'Nuit'], ['outil', 'Outils']];
const APP_CAT = { games: 'jouer', emo: 'jouer', core: 'jouer', youtube: 'voir', tiktok: 'voir', phone: 'voir', music: 'voir', link: 'lien', whatsapp: 'lien', face: 'lien', memory: 'lien', dream: 'nuit', holo: 'nuit', torch: 'nuit', weather: 'outil', iris: 'outil', esim: 'outil', locate: 'outil' };
const STORE_STARS = [['games', 'Cinq jeux, zéro ennui', '#ff8a3d', '#ff4d6d'], ['dream', 'Des nuits toutes douces', '#5b62c9', '#14224f'], ['youtube', 'Tes dessins animés préférés', '#ff5d5d', '#b3123a'], ['emo', 'Un œil plein d’émotions', '#ffb62e', '#ff6b8b']];
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
  box.innerHTML = `<div class="in">${storeIcon(id)}<div><small>À la une</small><b>${label}</b><span>${line}</span></div>${appOn(id) ? `<button type="button" class="open" data-go="${id}">Ouvrir</button>` : `<button type="button" class="get" data-get="${id}">Obtenir</button>`}</div><div class="dots">${STORE_STARS.map((_, i) => `<button type="button" data-star="${i}" class="${i === k % STORE_STARS.length ? 'on' : ''}" aria-label="${i + 1}"></button>`).join('')}</div>`;
}
const storeCard = ([id, label], i, on) => `<li data-app="${id}" data-cat="${APP_CAT[id] || 'outil'}" class="${on.includes(id) ? 'on' : ''}" style="--i:${i}">${storeIcon(id)}<b>${label}</b><span>${APP_NOTES[id] || ''}</span>
  <div class="act">${on.includes(id) ? `${EXTERNAL.some(([x]) => x === id) ? '<em>Installée ✓</em>' : `<button type="button" class="open" data-go="${id}">Ouvrir</button>`}<button type="button" class="drop" data-drop="${id}" aria-label="Retirer ${label}">×</button>` : `<button type="button" class="get" data-get="${id}">Obtenir</button>`}</div></li>`;
function openStore() {
  store.set('welcomed', true);
  focusEye();
  clearInterval(openStore.timer);
  const me = account(), on = appsOn();
  if (!me) {
    storeEye(`<i class="c-store">${ICON.store}</i><b>Bienvenue !</b><small>Créez votre compte pour commencer.</small>`);
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
  storeEye(`<i class="c-store">${ICON.store}</i><b>Beya Store</b><small>Choisis une application.</small>`);
  panel.innerHTML = `${backButton}<span class="pill">Beya Store</span><h2>Télécharger des applications</h2>
    <p class="acct">${me.child ? `<strong>${esc(me.child)}</strong> · ` : ''}${esc(me.email)} <button type="button" class="linkBtn" data-signout>Changer de compte</button></p>
    <div class="storeStar"></div>
    <div class="storeBar"><span>Ma collection</span><b></b><i></i></div>
    <div class="chips">${STORE_CATS.map(([id, label], i) => `<button type="button" data-cat="${id}" class="${i ? '' : 'on'}">${label}</button>`).join('')}</div>
    <ul class="storeGrid">${all.map((app, i) => storeCard(app, i, on)).join('')}</ul>
    <p class="muted">Déjà sur la peluche : Appels, Assistant, Heure, Histoires et Photo.</p>
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
  const card = panel.querySelector(`.storeGrid [data-app="${id}"]`);
  if (card?.classList.contains('loading')) return;
  pop(520);
  card?.classList.add('loading');
  panel.querySelectorAll(`[data-get="${id}"]`).forEach((b) => { b.disabled = true; b.classList.add('fill'); b.textContent = 'Téléchargement…'; });
  storeEye(`<div class="dl"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44"/><circle class="run" cx="50" cy="50" r="44" pathLength="100" transform="rotate(-90 50 50)"/></svg>${storeIcon(id)}</div><b>${app[1]}</b><small>Téléchargement…</small>`);
  setTimeout(() => {
    store.set('apps', [...new Set([...appsOn(), id])]);
    if (state.screen !== 'store') return;
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
  if (data.drop) return store.set('apps', appsOn().filter((id) => id !== data.drop)), openStore();
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
