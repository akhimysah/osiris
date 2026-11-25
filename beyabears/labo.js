// Le laboratoire BeyaBear’s : cinq applications de l'œil nées des maquettes « Living Eye ».
//   Émotions (emo)   : l'œil vivant, 12 émotions, un cœur qui bat, des zones à toucher sur la peluche
//   Lien (link)      : deux compagnons s'envoient un cœur, un câlin ou un petit mot
//   Souvenirs (memory) : un carnet gardé sur l'appareil
//   Nuit (dream)     : respiration douce, veilleuse, réveil lumineux
//   Socle (holo)     : le socle de recharge, sa batterie et son ambiance
// Tout est une simulation visuelle : aucun capteur, moteur, réseau ni appareil médical n'est branché.
// Ce fichier s'appuie sur app.js (screen, panel, state, store, esc, backButton, sayInEye) au moment de l'appel.

const LAB_APPS = [
  ['emo', 'Émotions', 'c-emo'],
  ['link', 'Lien', 'c-link'],
  ['memory', 'Souvenirs', 'c-memory'],
  ['dream', 'Nuit', 'c-dream'],
  ['holo', 'Socle', 'c-holo'],
];
const LAB_ICONS = {
  emo: '<circle cx="12" cy="12" r="9"/><path d="M12 16.5s-4.2-2.5-4.2-5.3A2.3 2.3 0 0 1 12 9.9a2.3 2.3 0 0 1 4.2 1.3c0 2.8-4.2 5.3-4.2 5.3z"/>',
  link: '<circle cx="7" cy="12" r="4"/><circle cx="17" cy="12" r="4"/><path d="M11 12h2"/>',
  memory: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M9 9h6M9 13h4"/>',
  dream: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  holo: '<ellipse cx="12" cy="17.5" rx="8" ry="3"/><path d="M12 3v8M9 8l3 3 3-3"/>',
};
const labNote = (text) => `<p class="muted labNote">${text}</p>`;
// Un minuteur qui s'arrête tout seul dès qu'on quitte l'application.
const labTimers = new Set();
function labEvery(app, ms, fn) {
  const id = setInterval(() => { if (state.screen !== app) { clearInterval(id); labTimers.delete(id); return; } fn(); }, ms);
  labTimers.add(id);
  return id;
}
function labClear() { labTimers.forEach((id) => clearInterval(id)); labTimers.clear(); clearTimeout(labClear.after); }
function labAfter(app, ms, fn) { clearTimeout(labClear.after); labClear.after = setTimeout(() => { if (state.screen === app) fn(); }, ms); }

// ---------- Émotions : l'œil vivant ----------

const GLYPH = {
  heart: '<path d="M50 86C8 58 22 22 50 42c28-20 42 16 0 44z"/>',
  note: '<path d="M40 22v40a13 11 0 1 1-8-10V14l38-8v40a13 11 0 1 1-8-10V22z"/>',
  star: '<path d="M50 8l11 27 29 3-22 20 7 29-25-15-25 15 7-29L10 38l29-3z"/>',
  ask: '<path d="M33 34a17 17 0 1 1 26 14c-6 4-9 7-9 15h-9c0-11 4-16 11-21a8 8 0 1 0-12-8zm8 36h10v10H41z"/>',
};
// couleur, battements par minute, message, motif dans la pupille, particules
const EMOTIONS = [
  ['normal', 'Normal', '👁️', '#29baff', 65, 'Présence naturelle', '', ''],
  ['joie', 'Joie', '😄', '#ffca55', 105, 'Moment de joie', '', '✦✧'],
  ['amour', 'Amour', '❤️', '#ff478c', 85, 'Je t’aime fort', 'heart', '♥'],
  ['musique', 'Musique', '🎵', '#fbbf24', 90, 'En rythme', 'note', '♪♫'],
  ['rire', 'Rire', '😂', '#f59e0b', 100, 'Trop drôle !', '', '✦'],
  ['surprise', 'Surprise', '😮', '#7dd3fc', 110, 'Oh !', '', '!'],
  ['tristesse', 'Tristesse', '😢', '#6f9bd8', 55, 'Un petit chagrin', '', '💧'],
  ['sommeil', 'Sommeil', '😴', '#827aff', 48, 'Repos paisible', '', 'z'],
  ['reflexion', 'Réflexion', '🤔', '#24e6c5', 70, 'Je réfléchis…', 'ask', '?'],
  ['fete', 'Fête', '🎉', '#ff7ad9', 115, 'C’est la fête !', 'star', '■●▲'],
  ['ecoute', 'Écoute', '👂', '#22d3ee', 75, 'Je suis à ton écoute', '', ''],
  ['clin', 'Clin d’œil', '😉', '#29baff', 70, 'Clin d’œil', '', ''],
];
// Zones de la peluche : là où seront les futurs capteurs.
const ZONES = [
  ['tete', 'Tête', 'joie', 'Caresse reçue'],
  ['patteG', 'Patte gauche', 'ecoute', 'Je suis à ton écoute'],
  ['patteD', 'Patte droite', 'musique', 'Raccourci musique'],
  ['poitrine', 'Poitrine', 'amour', 'Câlin reçu'],
  ['ventre', 'Ventre', 'rire', 'Chatouilles !'],
  ['dos', 'Dos', 'sommeil', 'Mode détente'],
];
const lab = { emo: 'normal', msg: '', zone: '' };

function emoDraw() {
  const [id, , , color, bpm, , glyph, fx] = EMOTIONS.find((e) => e[0] === lab.emo) || EMOTIONS[0];
  const bits = fx ? Array.from({ length: id === 'fete' ? 16 : 9 }, (_, i) => {
    const chars = [...fx], hue = id === 'fete' ? `color:hsl(${(i * 47) % 360} 90% 62%);` : '';
    return `<u style="left:${8 + ((i * 37) % 84)}%;animation-delay:${(-i * 0.43).toFixed(2)}s;animation-duration:${(2.4 + (i % 4) * 0.5).toFixed(1)}s;${hue}">${chars[i % chars.length]}</u>`;
  }).join('') : '';
  screen.innerHTML = `<div class="emo e-${id}" style="--c:${color};--t:${(60 / bpm).toFixed(3)}s">
    <div class="emoIris"></div><div class="emoRing"></div>
    ${id === 'ecoute' ? '<i class="emoWave"></i><i class="emoWave"></i><i class="emoWave"></i>' : ''}
    <div class="emoPupil">${glyph ? `<svg viewBox="0 0 100 100" aria-hidden="true">${GLYPH[glyph]}</svg>` : '<s></s>'}</div>
    <div class="emoLid top"></div><div class="emoLid bot"></div>
    <div class="emoFx" aria-hidden="true">${bits}</div>
    <div class="emoTag"><b>${bpm}</b> BPM</div>
  </div>`;
}
function emoPanel() {
  const cur = EMOTIONS.find((e) => e[0] === lab.emo) || EMOTIONS[0];
  panel.innerHTML = `${backButton}<span class="pill">Living Eye</span><h2>Émotions</h2>
    <p>Choisis une émotion : l’œil change de couleur, de forme et de rythme. Reviens à Normal pour retrouver la pupille.</p>
    <div class="emoGrid">${EMOTIONS.map(([id, label, emoji]) => `<button type="button" data-lab="emo" data-v="${id}" class="${id === lab.emo ? 'sel' : ''}" aria-pressed="${id === lab.emo}"><span aria-hidden="true">${emoji}</span>${label}</button>`).join('')}</div>
    <div class="heartLine" style="--c:${cur[3]};--t:${(60 / cur[4]).toFixed(3)}s"><i aria-hidden="true">♥</i><div><b>${cur[4]}</b> BPM<small>${lab.msg || cur[5]}</small></div></div>
    <h3 class="sub">Toucher <em>la peluche</em></h3>
    <p class="muted">Touche une zone : chaque contact déclenche une réaction dans l’œil.</p>
    <div class="touchBox">
      <svg class="touchBear" viewBox="0 0 300 310" role="img" aria-label="Peluche avec six zones à toucher">
        <g fill="#ead9b8" stroke="#c9b38a" stroke-width="2">
          <circle cx="100" cy="40" r="28"/><circle cx="200" cy="40" r="28"/>
          <ellipse class="${lab.zone === 'patteG' ? 'on' : ''}" data-lab="zone" data-v="patteG" cx="75" cy="194" rx="27" ry="53"/>
          <ellipse class="${lab.zone === 'patteD' ? 'on' : ''}" data-lab="zone" data-v="patteD" cx="225" cy="194" rx="27" ry="53"/>
          <ellipse class="${lab.zone === 'dos' ? 'on' : ''}" data-lab="zone" data-v="dos" cx="150" cy="205" rx="67" ry="83"/>
          <ellipse cx="110" cy="277" rx="35" ry="25"/><ellipse cx="190" cy="277" rx="35" ry="25"/>
          <circle class="${lab.zone === 'tete' ? 'on' : ''}" data-lab="zone" data-v="tete" cx="150" cy="92" r="66"/>
          <ellipse class="${lab.zone === 'poitrine' ? 'on' : ''}" data-lab="zone" data-v="poitrine" cx="150" cy="182" rx="38" ry="26" fill="#f3e6cb"/>
          <ellipse class="${lab.zone === 'ventre' ? 'on' : ''}" data-lab="zone" data-v="ventre" cx="150" cy="238" rx="42" ry="30" fill="#f3e6cb"/>
        </g>
        <g pointer-events="none"><circle cx="150" cy="92" r="34" fill="#06080f"/><circle cx="150" cy="92" r="24" fill="none" stroke="${cur[3]}" stroke-width="7"/><circle cx="150" cy="92" r="11" fill="#020309"/></g>
      </svg>
      <div class="touchKeys">${ZONES.map(([id, label]) => `<button type="button" data-lab="zone" data-v="${id}" class="${id === lab.zone ? 'sel' : ''}">${label}</button>`).join('')}</div>
    </div>
    ${labNote('Simulation visuelle, sans audio ni capteurs : sur la peluche, ces réactions viendront de capteurs de toucher. Les battements sont simulés, ce n’est pas un appareil médical.')}`;  // Sur iPhone, un dessin ne reçoit le toucher que si l'écouteur est posé directement dessus.
  panel.querySelectorAll('.touchBear [data-lab="zone"]').forEach((el) => {
    el.addEventListener('click', (event) => { event.stopPropagation(); const z = ZONES.find((x) => x[0] === el.dataset.v); if (z) emoSet(z[2], z[3], z[0]); });
  });
}
function emoSet(id, msg = '', zone = '') {
  lab.emo = id; lab.msg = msg; lab.zone = zone;
  emoDraw(); emoPanel();
  // Le clin d'œil ne dure qu'un instant.
  if (id === 'clin') labAfter('emo', 1700, () => emoSet('normal'));
}
function openEmo() {
  labClear();
  focusEye();
  emoSet(lab.emo === 'clin' ? 'normal' : lab.emo, lab.msg, lab.zone);
}

// ---------- Lien : deux compagnons, un lien ----------

const FRIENDS = ['Alya', 'Aaron', 'Mila', 'Kaï', 'Naya', 'Sana', 'Enzo', 'Zayn', 'Luna', 'Noah'];
const LINK_GIFTS = { coeur: ['♥', 'Je pense à toi'], calin: ['🤗', 'Un câlin pour toi'] };
function linkEye(big, text, small) {
  screen.innerHTML = `<div class="linkEye"><div class="linkBig">${big}</div><b>${esc(text)}</b><small>${small}</small></div>`;
}
function linkPanel(status = '') {
  const friend = store.get('lien', 'Alya'), log = store.get('lienLog', []);
  panel.innerHTML = `${backButton}<span class="pill">Beya Link</span><h2>Lien</h2>
    <p>Deux compagnons, un lien : envoie un cœur, un câlin ou un petit mot à la peluche d’un proche. Son œil s’allume, puis il te répond.</p>
    <div class="linkPair">
      <div><div class="miniEye"></div><b>Moi</b><small>${status ? 'Envoyé' : 'Prêt'}</small></div>
      <i class="linkDots${status ? '' : ' light'}" aria-hidden="true"><u></u><u></u><u></u></i>
      <div><div class="miniEye pink${status ? ' pulse' : ''}"></div><b>${esc(friend)}</b><small>${status ? esc(status) : 'En attente'}</small></div>
    </div>
    <label class="field">Compagnon relié<select id="linkFriend">${FRIENDS.map((n) => `<option${n === friend ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
    <div class="row"><button class="btn" type="button" data-lab="link" data-v="coeur">Envoyer un cœur</button><button class="btn light" type="button" data-lab="link" data-v="calin">Envoyer un câlin</button></div>
    <div class="row"><input id="linkMsg" maxlength="120" placeholder="Ton message" aria-label="Ton message"><button class="btn light" type="button" data-lab="link" data-v="mot">Envoyer</button></div>
    ${log.length ? `<h3 class="sub">Derniers <em>échanges</em></h3><ul class="linkLog">${log.slice(0, 5).map((l) => `<li><b>${esc(l.to)}</b><span>${esc(l.text)}</span><small>${esc(l.at)}</small></li>`).join('')}</ul>` : ''}
    ${labNote('Simulation sur un seul appareil : aucun message n’est envoyé sur le réseau. Sur les peluches, le lien passera par Internet entre deux compagnons appairés par les parents.')}`;
}
function linkSend(kind) {
  const friend = store.get('lien', 'Alya');
  const text = kind === 'mot' ? ($('#linkMsg')?.value || '').trim().slice(0, 120) : LINK_GIFTS[kind][1];
  if (!text) return $('#linkMsg')?.focus();
  const big = kind === 'mot' ? '✉' : LINK_GIFTS[kind][0];
  const at = new Date().toLocaleTimeString(document.documentElement.lang || 'fr', { hour: '2-digit', minute: '2-digit' });
  store.set('lienLog', [{ to: friend, text, at }, ...store.get('lienLog', [])].slice(0, 12));
  linkEye(big, text, 'Envoyé');
  linkPanel(text);
  // La réponse du compagnon relié, jouée ici pour la démonstration.
  labAfter('link', 2600, () => { linkEye('♥', friend, 'te répond'); $('.linkEye')?.classList.add('in'); });
}
function openLink() {
  labClear();
  focusEye();
  linkEye('♥', store.get('lien', 'Alya'), 'Compagnon relié');
  linkPanel();
}

// ---------- Souvenirs : le carnet ----------

function memoryList(filter = '') {
  const data = store.get('souvenirs', []), q = filter.toLowerCase();
  const items = data.map((x, i) => [x, i]).filter(([x]) => (x.t + ' ' + x.m).toLowerCase().includes(q));
  const fmt = (d) => { try { return d ? new Date(d + 'T12:00:00').toLocaleDateString(document.documentElement.lang || 'fr', { day: 'numeric', month: 'long', year: 'numeric' }) : ''; } catch (e) { return d; } };
  return items.length
    ? items.map(([x, i]) => `<article class="memo"><button type="button" class="memoOpen" data-lab="memoShow" data-v="${i}"><b>${esc(x.t)}</b><small>${esc(fmt(x.d))}</small><span>${esc(x.m)}</span></button><button type="button" class="memoDel" data-lab="memoDel" data-v="${i}" aria-label="Supprimer">×</button></article>`).join('')
    : `<p class="muted">${data.length ? 'Aucun souvenir ne correspond.' : 'Le carnet est vide. Écris ton premier souvenir.'}</p>`;
}
function memoryPanel() {
  const today = new Date().toISOString().slice(0, 10);
  panel.innerHTML = `${backButton}<span class="pill">Beya Memory</span><h2>Souvenirs</h2>
    <p>Mon carnet de souvenirs : une sortie, un anniversaire, un mot doux. Touche un souvenir pour le relire dans l’œil.</p>
    <label class="field">Titre<input id="memoT" maxlength="80"></label>
    <label class="field">Date<input id="memoD" type="date" value="${today}"></label>
    <label class="field">Souvenir<textarea id="memoM" maxlength="1000" rows="3"></textarea></label>
    <div class="row"><button class="btn" type="button" data-lab="memoAdd">Enregistrer</button></div>
    <h3 class="sub">Mon <em>carnet</em></h3>
    <input id="memoQ" placeholder="Rechercher" aria-label="Rechercher">
    <div id="memoItems">${memoryList()}</div>
    ${store.get('souvenirs', []).length ? '<div class="row"><button class="btn light" type="button" data-lab="memoClear">Tout effacer</button></div>' : ''}
    ${labNote('Les souvenirs restent sur cet appareil, sans chiffrement : n’y écris rien de sensible. Aucun envoi sur Internet.')}`;
}
function memoryEye(x) {
  if (!x) return sayInEye('Mon carnet de souvenirs', 'Souvenirs');
  screen.innerHTML = `<div class="say${(x.t + x.m).length > 90 ? ' long' : ''} story"><span><small>${esc(x.t)}</small>${esc(x.m)}</span></div>`;
}
function openMemory() {
  labClear();
  memoryEye(null);
  memoryPanel();
}

// ---------- Nuit : respiration, veilleuse, réveil ----------

const DREAM = { souffle: 'Respiration douce', veilleuse: 'Veilleuse', reveil: 'Réveil lumineux', repos: 'Repos' };
function dreamDraw() {
  const mode = lab.dream || 'veilleuse', level = lab.light ?? 60;
  screen.innerHTML = `<div class="dream d-${mode}" style="--l:${level / 100}">
    <div class="dreamSky"><u></u><u></u><u></u><u></u><u></u><u></u><u></u><u></u></div>
    <div class="dreamOrb"></div>
    ${mode === 'souffle' ? '<div class="dreamWords"><b>Inspire</b><b>Souffle</b></div>' : `<div class="dreamWords one"><b>${DREAM[mode]}</b></div>`}
  </div>`;
}
function dreamPanel() {
  const mode = lab.dream || 'veilleuse';
  panel.innerHTML = `${backButton}<span class="pill">Beya Dream</span><h2>Nuit</h2>
    <p>Pour s’endormir et se réveiller en douceur : l’œil respire avec l’enfant, veille dans le noir, puis se lève comme le soleil.</p>
    <div class="row wrap">${Object.entries(DREAM).map(([id, label]) => `<button class="btn${id === mode ? '' : ' light'}" type="button" data-lab="dream" data-v="${id}" aria-pressed="${id === mode}">${label}</button>`).join('')}</div>
    <label class="field">Luminosité<input id="dreamLight" type="range" min="10" max="100" value="${lab.light ?? 60}"></label>
    <p class="muted">${{ souffle: 'Inspire quand le cercle grandit, souffle quand il rétrécit. Quatre secondes, puis six.', veilleuse: 'Une lumière chaude et des étoiles, pour ne pas avoir peur du noir.', reveil: 'L’œil passe doucement de la nuit au jour, comme un lever de soleil. Ici, le lever dure vingt secondes.', repos: 'L’œil est presque éteint. Touche une autre ambiance pour le rallumer.' }[mode]}</p>
    ${labNote('Simulation visuelle : aucun réveil n’est programmé et aucun son n’est joué.')}`;
}
function dreamSet(mode) { lab.dream = mode; if (mode === 'repos') lab.light = 15; else if ((lab.light ?? 60) < 30) lab.light = 60; dreamDraw(); dreamPanel(); }
function openDream() {
  labClear();
  focusEye();
  dreamDraw(); dreamPanel();
}

// ---------- Socle : recharge et ambiance ----------

const HOLO_COLORS = ['#38bdf8', '#34d399', '#fbbf24', '#f472b6', '#a78bfa'];
const HOLO_MODES = { veille: 'Socle en veille', charge: 'Recharge en cours', plein: 'Charge terminée', enceinte: 'Mode enceinte', projection: 'Mode projection' };
function holoDraw() {
  const level = lab.battery ?? 35, color = lab.ambiance || HOLO_COLORS[0], mode = lab.holo || 'veille';
  const clock = new Date().toLocaleTimeString(document.documentElement.lang || 'fr', { hour: '2-digit', minute: '2-digit' });
  screen.innerHTML = `<div class="holo h-${mode}" style="--c:${color};--p:${level}">
    <div class="holoRing"></div>
    <div class="holoCore"><span><b>${level}</b>%</span><small>${HOLO_MODES[mode]}</small><em>${clock}</em></div>
    ${mode === 'enceinte' ? '<i class="emoWave"></i><i class="emoWave"></i><i class="emoWave"></i>' : ''}
    ${mode === 'projection' ? '<div class="holoStars"><u></u><u></u><u></u><u></u><u></u><u></u></div>' : ''}
  </div>`;
}
function holoPanel() {
  const mode = lab.holo || 'veille', color = lab.ambiance || HOLO_COLORS[0];
  panel.innerHTML = `${backButton}<span class="pill">Beya Holo</span><h2>Socle</h2>
    <p>Le socle où BeyaBear’s se pose le soir : il recharge la peluche, diffuse une lumière d’ambiance et peut servir d’enceinte.</p>
    <div class="dockShape" style="--c:${color}"><i></i></div>
    <div class="row wrap"><button class="btn${mode === 'charge' ? '' : ' light'}" type="button" data-lab="holo" data-v="charge">Simuler la recharge</button><button class="btn light" type="button" data-lab="holo" data-v="veille">Arrêter</button></div>
    <h3 class="sub">Lumière <em>d’ambiance</em></h3>
    <div class="colors">${HOLO_COLORS.map((c, i) => `<button type="button" data-lab="holoColor" data-v="${c}" class="${c === color ? 'sel' : ''}" aria-pressed="${c === color}" style="background:${c}" aria-label="Couleur ${i + 1}"></button>`).join('')}</div>
    <div class="row wrap"><button class="btn${mode === 'enceinte' ? '' : ' light'}" type="button" data-lab="holo" data-v="enceinte">Enceinte</button><button class="btn${mode === 'projection' ? '' : ' light'}" type="button" data-lab="holo" data-v="projection">Projection</button></div>
    ${labNote('Simulation : la batterie est fictive et aucun chargeur, enceinte ni projecteur n’est connecté.')}`;
}
function holoSet(mode) {
  labClear();
  lab.holo = mode;
  if (mode === 'charge') {
    if ((lab.battery ?? 35) >= 100) lab.battery = 35;
    labEvery('holo', 220, () => {
      lab.battery = Math.min(100, (lab.battery ?? 35) + 1);
      if (lab.battery >= 100) { lab.holo = 'plein'; labClear(); holoPanel(); }
      holoDraw();
    });
  }
  holoDraw(); holoPanel();
}
function openHolo() {
  labClear();
  focusEye();
  if (lab.holo === 'charge') lab.holo = 'veille';
  holoDraw(); holoPanel();
}

// ---------- Gestes ----------

document.addEventListener('click', (event) => {
  const el = event.target.closest('[data-lab]');
  if (!el) return;
  const v = el.dataset.v;
  switch (el.dataset.lab) {
    case 'emo': return emoSet(v);
    case 'zone': { const z = ZONES.find((x) => x[0] === v); return z && emoSet(z[2], z[3], z[0]); }
    case 'link': return linkSend(v);
    case 'memoAdd': {
      const t = $('#memoT').value.trim(), m = $('#memoM').value.trim();
      if (!t || !m) return toast('Écris un titre et un souvenir.');
      const item = { t, d: $('#memoD').value, m };
      store.set('souvenirs', [item, ...store.get('souvenirs', [])].slice(0, 200));
      memoryEye(item); memoryPanel(); focusEye();
      return toast('Souvenir enregistré sur cet appareil.');
    }
    case 'memoShow': return memoryEye(store.get('souvenirs', [])[Number(v)]), focusEye();
    case 'memoDel': return store.set('souvenirs', store.get('souvenirs', []).filter((_, i) => i !== Number(v))), memoryEye(null), memoryPanel();
    case 'memoClear': return el.dataset.sure ? (store.set('souvenirs', []), memoryEye(null), memoryPanel()) : ((el.dataset.sure = '1'), (el.textContent = 'Toucher encore pour tout effacer'));
    case 'dream': return dreamSet(v);
    case 'holo': return holoSet(v);
    case 'holoColor': return (lab.ambiance = v), holoDraw(), holoPanel();
  }
});
document.addEventListener('input', (event) => {
  const el = event.target;
  if (el.id === 'memoQ') $('#memoItems').innerHTML = memoryList(el.value);
  if (el.id === 'dreamLight') { lab.light = Number(el.value); $('.dream')?.style.setProperty('--l', lab.light / 100); }
});
document.addEventListener('change', (event) => {
  if (event.target.id === 'linkFriend') { store.set('lien', event.target.value); openLink(); }
});
