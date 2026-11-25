// Sécurité : le contrôle parental. Code parent, temps d'écran, heure du coucher, applications verrouillées,
// code demandé avant d'installer. Chargé avant app.js : go() appelle guard() avant d'ouvrir une application.
// Démonstration : tout reste sur l'appareil. Le code est gardé en clair par le navigateur : ce n'est pas une vraie protection.

const SEC_FREE = ['home', 'menu', 'secure', 'store', 'clock', 'call']; // toujours ouverts : on peut toujours appeler un parent
const SEC_LIMITS = [[0, 'Sans limite'], [30, '30 min'], [60, '1 h'], [120, '2 h']];
const sec = () => ({ pin: '', limit: 0, bedtime: false, askInstall: false, blocked: [], ...store.get('secure', {}) });
const secSave = (patch) => store.set('secure', { ...sec(), ...patch });
const secDay = () => new Date().toISOString().slice(0, 10);
const secUsed = () => { const u = store.get('usage', {}); return u.day === secDay() ? u.s || 0 : 0; };
const secNight = () => { const h = new Date().getHours(); return h >= 20 || h < 7; };
let secOpenUntil = 0; // le code parent ouvre tout pendant quinze minutes
let secNext = null; // ce qu'on voulait faire avant de saisir le code
const secOpen = () => secOpenUntil > Date.now();
const secShield = (text, sub = '') => { screen.innerHTML = `<div class="secEye"><i><img class="mascImg" src="m/secure.webp" alt=""></i><b>${text}</b>${sub ? `<small>${sub}</small>` : ''}</div>`; };

// Le temps d'écran ne compte que les applications, pas l'accueil ni les réglages.
setInterval(() => {
  if (typeof state === 'undefined' || document.hidden || SEC_FREE.includes(state.screen)) return;
  store.set('usage', { day: secDay(), s: secUsed() + 15 });
  const s = sec();
  if (s.pin && s.limit && !secOpen() && secUsed() >= s.limit * 60) guard(state.screen);
}, 15000);

// Appelé par go() : renvoie true quand l'application doit rester fermée.
function guard(name) {
  const s = sec();
  if (!s.pin || SEC_FREE.includes(name) || secOpen()) return false;
  const why = s.blocked.includes(name) ? 'Cette application est verrouillée par tes parents.'
    : s.bedtime && secNight() && !['story', 'dream'].includes(name) ? 'C’est l’heure de dormir. Les histoires et les veilleuses restent ouvertes.'
    : s.limit && secUsed() >= s.limit * 60 ? 'Le temps d’écran d’aujourd’hui est terminé.' : '';
  if (!why) return false;
  stopCamera(); stopSpeaking();
  setScreen('secure');
  secNext = { go: name };
  secShield('Chut…', 'Demande à un parent.');
  secPinPanel(why);
  return true;
}
function secPinPanel(why) {
  panel.innerHTML = `${backButton}<span class="pill">Sécurité</span><h2>Code parent</h2>
    <p>${why}</p>
    <form class="pin" id="pinForm"><input name="pin" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" required placeholder="••••" aria-label="Code parent à quatre chiffres" autocomplete="off"><button class="btn">Déverrouiller</button></form>
    <p class="muted">Le code ouvre tout pendant quinze minutes.</p>`;
}
// Avant une installation : true quand il faut d'abord le code parent.
function secAsk(id) {
  const s = sec();
  if (!s.pin || !s.askInstall || secOpen()) return false;
  secNext = { install: id };
  secShield('Code parent', 'Pour installer une application.');
  secPinPanel('Un parent doit saisir son code pour installer cette application.');
  return true;
}
function openSecure() {
  const s = sec();
  if (!s.pin) {
    secShield('Sécurité', 'Créez le code parent.');
    panel.innerHTML = `${backButton}<span class="pill">Sécurité</span><h2>Le contrôle parental</h2>
      <p>Choisissez un code à quatre chiffres. Il protège les réglages : temps d’écran, heure du coucher, applications autorisées et installations.</p>
      <form class="pin" id="pinNew"><input name="pin" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" required placeholder="••••" aria-label="Nouveau code parent à quatre chiffres" autocomplete="off"><button class="btn">Créer le code</button></form>
      <p class="notice">Démonstration : le code et les réglages restent sur cet appareil. Le navigateur garde le code en clair, ce n’est donc pas encore une vraie protection.</p>`;
    return;
  }
  if (!secOpen()) { secNext = { go: 'secure' }; secShield('Sécurité', 'Réservé aux parents.'); return secPinPanel('Saisissez le code parent pour ouvrir les réglages.'); }
  const used = Math.round(secUsed() / 60), mine = APPS.filter(([id]) => appOn(id) && !SEC_FREE.includes(id));
  secShield('Sécurité', s.limit ? `${used} min sur ${s.limit}` : `${used} min aujourd’hui`);
  panel.innerHTML = `${backButton}<span class="pill">Sécurité</span><h2>Le contrôle parental</h2>
    <div class="storeBar" style="--p:${s.limit ? Math.min(100, Math.round((used / s.limit) * 100)) : 0}"><span>Temps d’écran aujourd’hui</span><b>${used} min</b><i></i></div>
    <h3 class="sub">Limite <em>par jour</em></h3>
    <div class="chips">${SEC_LIMITS.map(([m, label]) => `<button type="button" data-sec-limit="${m}" class="${s.limit === m ? 'on' : ''}">${label}</button>`).join('')}</div>
    <label class="switch"><input type="checkbox" data-sec="bedtime" ${s.bedtime ? 'checked' : ''}><span><b>Heure du coucher</b><small>De 20 h à 7 h, seules les histoires et les veilleuses restent ouvertes.</small></span></label>
    <label class="switch"><input type="checkbox" data-sec="askInstall" ${s.askInstall ? 'checked' : ''}><span><b>Code avant d’installer</b><small>Le Beya Store demande le code parent pour chaque application.</small></span></label>
    <h3 class="sub">Applications <em>autorisées</em></h3>
    <ul class="secApps">${mine.map(([id, label]) => `<li>${storeIcon(id)}<b>${label}</b><label class="tog"><input type="checkbox" data-sec-app="${id}" ${s.blocked.includes(id) ? '' : 'checked'} aria-label="${label}"><i></i></label></li>`).join('')}</ul>
    <p class="muted">Appels, Heure et Beya Store restent toujours ouverts : l’enfant peut toujours appeler un parent.</p>
    <div class="row wrap"><button type="button" class="btn" data-sec-lock>Verrouiller maintenant</button><button type="button" class="btn light" data-sec-reset>Changer le code</button></div>
    <p class="notice">Démonstration : le code et les réglages restent sur cet appareil. Le navigateur garde le code en clair, ce n’est donc pas encore une vraie protection.</p>`;
}
document.addEventListener('submit', (event) => {
  const f = event.target;
  if (f.id !== 'pinForm' && f.id !== 'pinNew') return;
  event.preventDefault();
  const pin = f.pin.value.trim();
  if (!/^\d{4}$/.test(pin)) return toast('Le code a quatre chiffres.');
  if (f.id === 'pinNew') { secSave({ pin }); secOpenUntil = Date.now() + 15 * 60000; toast('Code parent créé.'); return openSecure(); }
  if (pin !== sec().pin) { f.pin.value = ''; f.classList.remove('no'); void f.offsetWidth; f.classList.add('no'); return toast('Ce n’est pas le bon code.'); }
  secOpenUntil = Date.now() + 15 * 60000;
  const next = secNext; secNext = null;
  if (next && next.install) return go('store'), storeDetail(next.install), storeGet(next.install);
  go(next && next.go ? next.go : 'secure');
});
document.addEventListener('click', (event) => {
  const b = event.target.closest && event.target.closest('button');
  if (!b) return;
  if (b.dataset.secLimit) return secSave({ limit: Number(b.dataset.secLimit) }), openSecure();
  if ('secLock' in b.dataset) return (secOpenUntil = 0), toast('Réglages verrouillés.'), go('menu');
  if ('secReset' in b.dataset) return secSave({ pin: '' }), openSecure();
});
document.addEventListener('change', (event) => {
  const el = event.target;
  if (el.dataset.sec) return secSave({ [el.dataset.sec]: el.checked });
  if (el.dataset.secApp) { const s = sec(), id = el.dataset.secApp; secSave({ blocked: el.checked ? s.blocked.filter((x) => x !== id) : [...new Set([...s.blocked, id])] }); }
});
