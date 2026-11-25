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
function openStore() {
  store.set('welcomed', true);
  focusEye();
  const me = account(), on = appsOn();
  if (!me) {
    storeEye(`<i class="c-store">${ICON.store}</i><b>Bienvenue !</b><small>Créez votre compte pour commencer.</small>`);
    panel.innerHTML = `${backButton}<span class="pill">Première mise en route</span><h2>Votre compte BeyaBear’s</h2>
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
  const all = [...APPS.map(([id, label, color]) => [id, label, color]), ...EXTERNAL.map(([id, label, color]) => [id, label, color])].filter(([id]) => !PREINSTALLED.includes(id));
  storeEye(`<i class="c-store">${ICON.store}</i><b>Beya Store</b><small>${on.length - 1} applications installées</small>`);
  panel.innerHTML = `${backButton}<span class="pill">Beya Store</span><h2>Télécharger des applications</h2>
    <p class="acct">${me.child ? `<strong>${esc(me.child)}</strong> · ` : ''}${esc(me.email)} <button type="button" class="linkBtn" data-signout>Changer de compte</button></p>
    <ul class="storeList">${all.map(([id, label, color]) => `<li>${storeIcon(id)}<div><b>${label}</b><span>${APP_NOTES[id] || ''}</span></div>${
      on.includes(id) ? `<button type="button" class="got" data-drop="${id}" aria-label="Supprimer ${label}">Installée ✓</button>` : `<button type="button" class="get" data-get="${id}">Obtenir</button>`}</li>`).join('')}</ul>
    <p class="muted">Déjà sur la peluche : Appels, Assistant, Heure, Histoires et Photo. Touchez « Installée » pour retirer une application.</p>
    <p class="notice">Démonstration : toutes les applications sont gratuites ici et rien n’est réellement téléchargé.</p>`;
}
// Téléchargement simulé : un anneau se remplit dans l'œil, puis l'application rejoint le menu.
function storeGet(id) {
  const app = [...APPS, ...EXTERNAL].find(([x]) => x === id);
  if (!app || !account()) return openStore();
  storeEye(`<div class="dl"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44"/><circle class="run" cx="50" cy="50" r="44" pathLength="100" transform="rotate(-90 50 50)"/></svg>${storeIcon(id)}</div><b>${app[1]}</b><small>Téléchargement…</small>`);
  clearTimeout(storeGet.timer);
  storeGet.timer = setTimeout(() => {
    store.set('apps', [...new Set([...appsOn(), id])]);
    if (state.screen !== 'store') return;
    openStore();
    storeEye(`${storeIcon(id)}<b>${app[1]}</b><small>Installée</small>${EXTERNAL.some(([x]) => x === id) ? '' : `<button type="button" class="open" data-go="${id}">Ouvrir</button>`}`);
  }, 1600);
}
document.addEventListener('submit', (event) => {
  if (event.target.id !== 'accountForm') return;
  event.preventDefault();
  const email = event.target.email.value.trim(), child = event.target.child.value.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast('Adresse e-mail incomplète.');
  store.set('account', { email, child });
  store.set('email', email);
  toast('Compte créé sur cet appareil.');
  openStore();
});
document.addEventListener('click', (event) => {
  const data = event.target.closest && event.target.closest('button')?.dataset;
  if (!data) return;
  if (data.get) return storeGet(data.get);
  if (data.drop) return store.set('apps', appsOn().filter((id) => id !== data.drop)), openStore();
  if ('signout' in data) return store.set('account', null), openStore();
});
