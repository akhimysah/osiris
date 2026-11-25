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
  ['core', 'Cœur', 'c-core'],
  ['link', 'Lien', 'c-link'],
  ['memory', 'Souvenirs', 'c-memory'],
  ['dream', 'Nuit', 'c-dream'],
  ['holo', 'Socle', 'c-holo'],
  ['locate', 'Localisation', 'c-locate'],
  ['music', 'Spotify', 'c-spotify'],
];
const LAB_ICONS = {
  emo: '<circle cx="12" cy="12" r="9"/><path d="M12 16.5s-4.2-2.5-4.2-5.3A2.3 2.3 0 0 1 12 9.9a2.3 2.3 0 0 1 4.2 1.3c0 2.8-4.2 5.3-4.2 5.3z"/>',
  core: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
  link: '<circle cx="7" cy="12" r="4"/><circle cx="17" cy="12" r="4"/><path d="M11 12h2"/>',
  memory: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M9 9h6M9 13h4"/>',
  dream: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  music: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  locate: '<path d="M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.4"/>',
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
// Trois éditions, une par personnage : Living Eye (Mila), Cosmic Eye (Aaron), Quantum Eye (Zayn).

const GLYPH = {
  heart: '<path d="M50 86C8 58 22 22 50 42c28-20 42 16 0 44z"/>',
  note: '<path d="M40 22v40a13 11 0 1 1-8-10V14l38-8v40a13 11 0 1 1-8-10V22z"/>',
  star: '<path d="M50 8l11 27 29 3-22 20 7 29-25-15-25 15 7-29L10 38l29-3z"/>',
  ask: '<path d="M33 34a17 17 0 1 1 26 14c-6 4-9 7-9 15h-9c0-11 4-16 11-21a8 8 0 1 0-12-8zm8 36h10v10H41z"/>',
};
// identifiant, nom, émoji, couleur, battements par minute, message, motif dans la pupille, particules
const EMOTIONS = [
  ['normal', 'Normal', '👁️', '#29baff', 65, 'Présence naturelle', '', ''],
  ['joie', 'Joie', '😁', '#ffca55', 105, 'Moment de joie', '', '✦✧'],
  ['amour', 'Affection', '❤️', '#ff478c', 85, 'Je t’aime fort', 'heart', '♥'],
  ['musique', 'Musique', '🎵', '#fbbf24', 90, 'En rythme', 'note', '♪♫'],
  ['rire', 'Rire', '😂', '#f59e0b', 100, 'Trop drôle !', '', '✦'],
  ['surprise', 'Surprise', '😮', '#7dd3fc', 110, 'Oh !', '', '!'],
  ['tristesse', 'Tristesse', '😢', '#6f9bd8', 55, 'Un petit chagrin', '', '💧'],
  ['sommeil', 'Sommeil', '😴', '#827aff', 48, 'Repos paisible', '', 'z'],
  ['reflexion', 'Réflexion', '🤔', '#24e6c5', 70, 'Je réfléchis…', 'ask', '?'],
  ['fete', 'Célébration', '🎉', '#ff7ad9', 115, 'C’est la fête !', 'star', '■●▲'],
  ['ecoute', 'Écoute', '👂', '#22d3ee', 75, 'Je suis à ton écoute', '', ''],
  ['clin', 'Complicité', '😉', '#29baff', 70, 'Clin d’œil complice', '', ''],
  ['alerte', 'Alerte', '🚨', '#ff4d4d', 120, 'Attention !', '', '!'],
  ['portail', 'Portail', '🌀', '#b06bff', 80, 'Portail ouvert', '', '✦'],
];
// édition, nom de l'œil, personnage, signature, couleur de base, modes proposés
const EDITIONS = [
  ['living', 'Living Eye', 'Mila', 'Superstar', '#ff7ad9', ['normal', 'joie', 'amour', 'musique', 'rire', 'surprise', 'tristesse', 'sommeil', 'reflexion', 'fete', 'ecoute', 'clin']],
  ['cosmic', 'Cosmic Eye', 'Aaron', 'Le Geek', '#5b8cff', ['normal', 'ecoute', 'reflexion', 'joie', 'sommeil', 'alerte', 'portail']],
  ['quantum', 'Quantum Eye', 'Zayn', 'Protector Edition', '#ff2d55', ['normal', 'reflexion', 'joie', 'sommeil', 'alerte', 'portail']],
];
const QUANTUM_COLORS = [['#ff2d55', 'Rouge rubis'], ['#2d7bff', 'Bleu électrique']];
// Zones de la peluche : là où seront les futurs capteurs.
const ZONES = [
  ['tete', 'Tête', 'joie', 'Caresse reçue'],
  ['patteG', 'Patte gauche', 'ecoute', 'Je suis à ton écoute'],
  ['patteD', 'Patte droite', 'musique', 'Raccourci musique'],
  ['poitrine', 'Poitrine', 'amour', 'Câlin reçu'],
  ['ventre', 'Ventre', 'rire', 'Chatouilles !'],
  ['dos', 'Dos', 'sommeil', 'Mode détente'],
];
const lab = { emo: 'normal', msg: '', zone: '', edition: 'living', blink: true };
// Anneau segmenté qui tourne, comme une pièce de machine (Quantum Eye et Cœur).
const labRing = (r, w, dash, dur, dir, op) => `<circle cx="100" cy="100" r="${r}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-dasharray="${dash}" opacity="${op}" style="animation:emoSpin ${dur}s linear infinite ${dir ? 'reverse' : ''};transform-origin:100px 100px"/>`;
const emoEdition = () => EDITIONS.find((e) => e[0] === lab.edition) || EDITIONS[0];
// L'iris « fréquences » : des rayons de longueurs différentes qui bougent sans arrêt, comme un égaliseur,
// entourés d'anneaux en pointillés qui tournent. Chaque émotion a son énergie : ample et rapide quand il
// écoute, lente quand il dort, nerveuse en alerte.
const FREQ = {
  normal: [0.55, 1, 0], ecoute: [1, 3.2, 0], reflexion: [0.7, 0.8, 1], joie: [0.92, 2.3, 0], sommeil: [0.22, 0.32, 0], alerte: [1, 6, 2],
  amour: [0.7, 1.4, 0], musique: [1, 2.8, 0], rire: [0.95, 3.6, 2], surprise: [1, 1.2, 0], tristesse: [0.3, 0.5, 0], fete: [1, 3, 0], clin: [0.55, 1, 0], portail: [0.85, 2, 1],
};
const FREQ_SEEDS = Array.from({ length: 180 }, (_, i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); });
let freqRaf = 0;
function emoFreqStart() {
  cancelAnimationFrame(freqRaf);
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tick = (now) => {
    const cv = $('.emoFreq');
    if (!cv || state.screen !== 'emo') return;
    const box = cv.clientWidth, dpr = Math.min(2, window.devicePixelRatio || 1), size = Math.round(box * dpr);
    if (size < 20) return void (freqRaf = requestAnimationFrame(tick));
    if (cv.width !== size) cv.width = cv.height = size;
    const g = cv.getContext('2d'), c = size / 2, t = still ? 0 : now / 1000, id = lab.emo, ed = lab.edition;
    const [amp, speed, mode] = FREQ[id] || FREQ.normal, color = emoColor(id);
    const pupil = $('.emoPupil'), big = id === 'portail';
    const r0 = (big ? (id === 'portail' ? 0.36 : 0.27) : Math.max(0.1, (pupil ? pupil.offsetWidth : box * 0.46) / 2 / box) + 0.012) * size;
    const rMax = (ed === 'quantum' ? 0.235 : 0.405) * size, span = Math.max(4, rMax - r0), n = FREQ_SEEDS.length;
    g.clearRect(0, 0, size, size);
    g.lineCap = 'round'; g.strokeStyle = color; g.shadowColor = color; g.shadowBlur = size * 0.012;
    const beat = 0.5 + 0.5 * Math.sin(t * speed * 3.1);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + t * 0.05, s = FREQ_SEEDS[i];
      // Une onde lente, une rapide, et pour la réflexion une vague qui tourne autour de la pupille.
      let k = 0.5 + 0.5 * Math.sin(t * speed * 1.7 + s * 6.283);
      k *= 0.62 + 0.38 * Math.sin(i * 0.21 + t * speed * 0.6);
      if (mode === 1) k = 0.25 + 0.75 * Math.pow(0.5 + 0.5 * Math.sin(a * 3 - t * 2.2), 2) * (0.6 + 0.4 * s);
      if (mode === 2) k = Math.abs(Math.sin(t * speed * 2 + s * 40)) * (0.5 + 0.5 * s);
      if (id === 'ecoute' || id === 'musique') k *= 0.55 + 0.45 * beat;
      const len = span * (0.34 + 0.26 * s + 0.5 * amp * Math.max(0, k));
      g.globalAlpha = 0.45 + 0.55 * Math.min(1, len / span);
      g.lineWidth = size * (i % 3 === 0 ? 0.0075 : 0.0045);
      g.beginPath(); g.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0); g.lineTo(c + Math.cos(a) * (r0 + len), c + Math.sin(a) * (r0 + len)); g.stroke();
    }
    // Bord de la pupille, puis les anneaux en pointillés (absents en Quantum, qui a ses propres anneaux).
    g.globalAlpha = 0.95; g.lineWidth = size * 0.006; g.setLineDash([]); g.beginPath(); g.arc(c, c, r0 - size * 0.004, 0, 6.2832); g.stroke();
    if (ed !== 'quantum') {
      const rings = [[0.428, 0.012, [0.02, 0.016], 0.12, 0.9], [0.455, 0.005, [0.05, 0.02], -0.08, 0.6], [0.478, 0.003, [0.012, 0.03], 0.05, 0.45]];
      for (const [r, w, dash, spin, alpha] of rings) {
        g.globalAlpha = alpha * (0.75 + 0.25 * amp); g.lineWidth = size * w; g.lineCap = 'butt'; g.setLineDash(dash.map((d) => d * size)); g.lineDashOffset = -t * spin * speed * size * 0.2;
        g.beginPath(); g.arc(c, c, r * size, 0, 6.2832); g.stroke();
      }
      g.setLineDash([]);
    }
    g.globalAlpha = 1; g.shadowBlur = 0;
    if (!still) freqRaf = requestAnimationFrame(tick);
  };
  freqRaf = requestAnimationFrame(tick);
}
function emoColor(id) {
  const [ed, , , , base] = emoEdition(), own = (EMOTIONS.find((e) => e[0] === id) || EMOTIONS[0])[3];
  if (id === 'alerte') return '#ff4d4d';
  if (ed === 'quantum') return lab.qcolor || QUANTUM_COLORS[0][0];
  if (ed === 'cosmic') return id === 'portail' ? '#b06bff' : base;
  return id === 'normal' || id === 'clin' ? base : own;
}
function emoDraw() {
  const [id, , emoji, , bpm, , , fx] = EMOTIONS.find((e) => e[0] === lab.emo) || EMOTIONS[0];
  const ed = lab.edition, color = emoColor(id);
  const bits = fx ? Array.from({ length: id === 'fete' ? 16 : 9 }, (_, i) => {
    const chars = [...fx], hue = id === 'fete' ? `color:hsl(${(i * 47) % 360} 90% 62%);` : '';
    return `<u style="left:${8 + ((i * 37) % 84)}%;animation-delay:${(-i * 0.43).toFixed(2)}s;animation-duration:${(2.4 + (i % 4) * 0.5).toFixed(1)}s;${hue}">${chars[i % chars.length]}</u>`;
  }).join('') : '';
  // Les paupières servent déjà à certaines émotions : on ne cligne que quand elles sont libres.
  const canBlink = lab.blink && !['joie', 'rire', 'tristesse', 'sommeil', 'reflexion', 'clin'].includes(id);
  screen.innerHTML = `<div class="emo e-${id} ed-${ed}${canBlink ? ' blink' : ''}" style="--c:${color};--t:${(60 / bpm).toFixed(3)}s">
    ${ed === 'cosmic' ? '<div class="emoNebula"></div><div class="emoStars"><u></u><u></u><u></u><u></u><u></u><u></u><u></u><u></u><u></u><u></u></div>' : ''}
    <canvas class="emoFreq" aria-hidden="true"></canvas>
    ${ed === 'quantum' ? `<div class="emoNeon${(lab.qcolor || QUANTUM_COLORS[0][0]) === '#2d7bff' ? '' : ' ruby'}"></div>` : ''}
    <div class="emoRing"></div>
    ${id === 'ecoute' ? '<i class="emoWave"></i><i class="emoWave"></i><i class="emoWave"></i>' : ''}
    <div class="emoPupil">${id === 'portail' ? '<div class="emoPortal"><i></i><i></i></div>' : id === 'normal' ? '<s></s>' : `<span class="emoMoji">${emoji}</span>`}</div>
    <div class="emoLid top"></div><div class="emoLid bot"></div>
    <div class="emoFx" aria-hidden="true">${bits}</div>
    <div class="emoTag"><b>${bpm}</b> BPM</div>
  </div>`;
  emoFreqStart();
}
function emoPanel() {
  const [ed, eye, hero, sign, , modes] = emoEdition();
  const cur = EMOTIONS.find((e) => e[0] === lab.emo) || EMOTIONS[0], color = emoColor(cur[0]);
  panel.innerHTML = `${backButton}<span class="pill">${eye}</span><h2>Émotions</h2>
    <p>Chaque compagnon a son regard. Choisis une édition, puis une émotion : l’œil change de couleur, de forme et de rythme.</p>
    <div class="edGrid">${EDITIONS.map(([id, name, who, tag, c]) => `<button type="button" data-lab="edition" data-v="${id}" class="${id === ed ? 'sel' : ''}" aria-pressed="${id === ed}" style="--c:${id === 'quantum' ? lab.qcolor || c : c}"><i></i><b>${who}</b><span>${name}</span><small>${tag}</small></button>`).join('')}</div>
    ${ed === 'quantum' ? `<div class="row wrap">${QUANTUM_COLORS.map(([c, label]) => `<button class="btn${(lab.qcolor || QUANTUM_COLORS[0][0]) === c ? '' : ' light'}" type="button" data-lab="qcolor" data-v="${c}"><i class="dot" style="background:${c}"></i>${label}</button>`).join('')}</div>` : ''}
    <div class="emoGrid">${modes.map((id) => EMOTIONS.find((e) => e[0] === id)).map(([id, label, emoji]) => `<button type="button" data-lab="emo" data-v="${id}" class="${id === lab.emo ? 'sel' : ''}" aria-pressed="${id === lab.emo}"><span aria-hidden="true">${emoji}</span>${label}</button>`).join('')}</div>
    <div class="heartLine" style="--c:${color};--t:${(60 / cur[4]).toFixed(3)}s"><i aria-hidden="true">♥</i><div><em>${hero}</em><b>${cur[4]}</b> BPM<small>${lab.msg || cur[5]}</small></div></div>
    <label class="check"><input type="checkbox" id="emoSolo" ${stage.classList.contains('eyeView') ? 'checked' : ''}> Œil seul</label>
    <label class="check"><input type="checkbox" id="emoNoBlink" ${lab.blink ? '' : 'checked'}> Sans clignement</label>
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
        <g pointer-events="none"><circle cx="150" cy="92" r="34" fill="#06080f"/><circle cx="150" cy="92" r="24" fill="none" stroke="${color}" stroke-width="7"/><circle cx="150" cy="92" r="11" fill="#020309"/></g>
      </svg>
      <div class="touchKeys">${ZONES.map(([id, label]) => `<button type="button" data-lab="zone" data-v="${id}" class="${id === lab.zone ? 'sel' : ''}">${label}</button>`).join('')}</div>
    </div>
    ${labNote(ed === 'living' ? 'Simulation visuelle, sans audio ni capteurs : sur la peluche, ces réactions viendront de capteurs de toucher. Les battements sont simulés, ce n’est pas un appareil médical.' : 'Prototype visuel autonome : le portail est simulé, aucune caméra ni application n’est connectée. Les battements sont simulés, ce n’est pas un appareil médical.')}`;
  // Sur iPhone, un dessin ne reçoit le toucher que si l'écouteur est posé directement dessus.
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
function emoEditionSet(id) {
  lab.edition = id;
  // Une émotion absente de l'édition choisie revient à Normal.
  emoSet(emoEdition()[5].includes(lab.emo) ? lab.emo : 'normal');
}
function openEmo() {
  const asked = params.get('emo');
  if (asked && !openEmo.done && EMOTIONS.some((e) => e[0] === asked)) lab.emo = asked;
  openEmo.done = true;
  labClear();
  focusEye();
  emoSet(lab.emo === 'clin' ? 'normal' : lab.emo, lab.msg, lab.zone);
}

// ---------- Cœur : le cœur énergétique ----------
// Un cœur de lumière au centre de la peluche : cinq éléments, une énergie réglable, un rythme qui suit.

const ELEMENTS = [
  ['cosmique', 'Cosmique', '#38a8ff'],
  ['energie', 'Énergie', '#9cf542'],
  ['amour', 'Amour', '#ff5c9a'],
  ['mystique', 'Mystique', '#a56bff'],
  ['solaire', 'Solaire', '#f5b83d'],
];
const coreBpm = () => Math.round(45 + (lab.energy ?? 70) * 0.22);
function coreDraw() {
  const [, , color] = ELEMENTS.find((e) => e[0] === (lab.element || 'cosmique')), e = (lab.energy ?? 70) / 100;
  // Anneaux segmentés, comme une pièce de machine : chacun tourne à sa vitesse.
  const ring = labRing;
  screen.innerHTML = `<div class="core" style="--c:${color};--e:${e.toFixed(2)};--t:${(60 / coreBpm()).toFixed(3)}s">
    <div class="coreGlow"></div>
    <div class="coreRays"></div>
    <svg class="coreRings" viewBox="0 0 200 200" aria-hidden="true">
      ${ring(94, 1, '2 5', 60, 0, 0.55)}${ring(88, 3.2, '26 7 4 7', 26, 1, 0.9)}${ring(80, 1.2, '60 9', 40, 0, 0.6)}
      ${ring(72, 5, '48 6 10 6', 18, 0, 1)}${ring(63, 1.4, '3 4', 30, 1, 0.7)}${ring(56, 2.6, '70 12', 14, 1, 0.95)}
      <g stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity=".95"><path d="M8 100h10M182 100h10M100 8v10M100 182v10"/></g>
    </svg>
    <div class="corePupil"><s></s></div>
    <div class="emoTag"><b>${coreBpm()}</b> BPM</div>
  </div>`;
}
function corePanel() {
  const el = lab.element || 'cosmique', energy = lab.energy ?? 70, color = ELEMENTS.find((x) => x[0] === el)[2];
  panel.innerHTML = `${backButton}<span class="pill">BeyaBear’s Core</span><h2>Cœur</h2>
    <p>Le cœur énergétique de la peluche : monte l’énergie et change d’élément pour voir l’iris et la pupille réagir.</p>
    <div class="coreStats" style="--c:${color}">
      <div><small>Rythme cardiaque simulé</small><b id="coreBpm">${coreBpm()}</b><i>BPM</i></div>
      <div><small>Énergie du cœur</small><b><span id="coreE">${energy}</span>%</b></div>
      <div class="coreBar"><u id="coreFill" style="width:${energy}%"></u></div>
    </div>
    <label class="field">Énergie<input id="coreEnergy" type="range" min="0" max="100" value="${energy}"></label>
    <div class="coreEls">${ELEMENTS.map(([id, label, c]) => `<button type="button" data-lab="element" data-v="${id}" class="${id === el ? 'sel' : ''}" aria-pressed="${id === el}" style="--c:${c}"><img src="e-${id}.webp" alt="" width="360" height="360" loading="lazy">${label}</button>`).join('')}</div>
    ${labNote('Prototype expérimental : le rythme et l’énergie sont simulés. Sur la peluche, un petit moteur de vibration fera sentir ce battement sous la main. Ce n’est pas un appareil médical.')}`;
}
function openCore() {
  labClear();
  focusEye();
  coreDraw(); corePanel();
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

// ---------- Localisation : où est la peluche ----------
// Par défaut, une carte de démonstration. Si la personne l'autorise, la vraie position de l'appareil s'affiche.

function locateEye(found) {
  const pos = lab.pos;
  screen.innerHTML = `<div class="loc${found ? ' found' : ''}"><div class="locMap"></div><i class="locRing"></i><i class="locRing"></i><div class="locPin"></div>
    <div class="locTag"><b>${found ? 'Position trouvée' : 'À la maison'}</b><small>${found && pos ? `${pos.lat.toFixed(3)}, ${pos.lon.toFixed(3)}` : 'Carte de démonstration'}</small></div></div>`;
}
function locatePanel(status = '') {
  const pos = lab.pos;
  panel.innerHTML = `${backButton}<span class="pill">Beya Locate</span><h2>Localisation</h2>
    <p>Pour savoir où se trouve la peluche : à la maison, chez mamie ou oubliée à l’école. Seuls les parents voient sa position.</p>
    <div class="row wrap"><button class="btn" type="button" data-lab="locate">Me localiser</button>${pos ? `<a class="btn light" target="_blank" rel="noopener" href="https://www.openstreetmap.org/?mlat=${pos.lat}&mlon=${pos.lon}#map=16/${pos.lat}/${pos.lon}">Voir sur la carte</a>` : ''}</div>
    ${status ? `<p>${status}</p>` : ''}
    ${pos ? `<p class="muted">Précision : environ ${Math.round(pos.acc)} mètres.</p>` : ''}
    ${labNote('Ici, c’est la position de cet appareil qui est utilisée, seulement si vous l’autorisez. Elle reste sur cet appareil et n’est envoyée nulle part. Sur la peluche, la localisation demandera une puce GPS ou le forfait mobile.')}`;
}
function locateMe() {
  if (!navigator.geolocation) return toast('La position n’est pas disponible sur cet appareil.');
  locatePanel('Recherche de la position…');
  navigator.geolocation.getCurrentPosition(
    (p) => { lab.pos = { lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy }; if (state.screen === 'locate') { locateEye(true); locatePanel('Position trouvée.'); } },
    () => { if (state.screen === 'locate') locatePanel('Position non autorisée ou introuvable.'); },
    { timeout: 10000, maximumAge: 60000 },
  );
}
function openLocate() {
  labClear();
  focusEye();
  locateEye(Boolean(lab.pos)); locatePanel();
}

// ---------- Musique : les morceaux se jouent dans l'œil ----------

const ARTIST = 'Chanteur Grave Groove';
const TRACKS = ['Safi Ma Bgitsh', 'Bared ou Skhoun', 'Ya Bent L’Mdina', 'Lahbib Li Walafto', 'Black9ett', ...Array.from({ length: 10 }, (_, i) => `Yallah Groove ${i + 1}`)];
const music = { audio: null, n: 0 };
const musicTime = (s) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');
function musicAudio() {
  if (music.audio) return music.audio;
  const a = (music.audio = new Audio());
  a.preload = 'none';
  a.addEventListener('ended', () => musicPlay(music.n + 1));
  ['play', 'pause'].forEach((e) => a.addEventListener(e, () => state.screen === 'music' && (musicEye(), musicPanel())));
  a.addEventListener('timeupdate', () => {
    if (state.screen !== 'music') return;
    const p = a.duration ? a.currentTime / a.duration : 0, bar = $('#musicBar u'), t = $('#musicNow'), ring = $('.musEye');
    if (bar) bar.style.width = `${p * 100}%`; if (t) t.textContent = `${musicTime(a.currentTime)} / ${musicTime(a.duration)}`; if (ring) ring.style.setProperty('--p', (p * 100).toFixed(1));
  });
  a.addEventListener('error', () => state.screen === 'music' && toast('Le morceau ne se charge pas. Vérifiez la connexion.'));
  return a;
}
function musicPlay(n) {
  const a = musicAudio(); music.n = ((n % TRACKS.length) + TRACKS.length) % TRACKS.length;
  a.src = `musique/${music.n + 1}.mp3?v=1`; a.play().catch(() => {});
  musicEye(); musicPanel();
}
function musicToggle() { const a = musicAudio(); if (!a.src) return musicPlay(music.n); a.paused ? a.play().catch(() => {}) : a.pause(); }
function musicStop() { if (music.audio) music.audio.pause(); }
function musicEye() {
  const on = music.audio && !music.audio.paused;
  screen.innerHTML = `<div class="musEye${on ? ' on' : ''}" style="--p:0"><div class="musRing"></div><div class="musDisc"><img src="musique/pochette.webp" alt=""></div>
    <div class="musBars"><u></u><u></u><u></u><u></u><u></u><u></u><u></u></div><div class="musTag"><b>${esc(TRACKS[music.n])}</b><small>${ARTIST}</small></div></div>`;
}
function musicPanel() {
  const a = music.audio, on = a && !a.paused;
  panel.innerHTML = `${backButton}<span class="pill">Beya Music</span><h2>Musique</h2>
    <p>La musique se joue dans l’œil : touchez un morceau, la peluche danse avec le rythme.</p>
    <div class="musArtist"><img src="musique/pochette.webp" alt="Pochette de ${ARTIST}" width="480" height="480"><div><small>Artiste</small><b>${ARTIST}</b><span>Moroccan Funk · Afro-House Groove · ${TRACKS.length} titres</span></div></div>
    <div class="musCtl"><button type="button" data-lab="musPrev" aria-label="Morceau précédent">⏮</button><button type="button" class="big" data-lab="musToggle" aria-label="${on ? 'Pause' : 'Lecture'}">${on ? '⏸' : '▶'}</button><button type="button" data-lab="musNext" aria-label="Morceau suivant">⏭</button></div>
    <div class="musBar" id="musicBar"><u></u></div><p class="muted" id="musicNow" style="text-align:center">${a ? `${musicTime(a.currentTime)} / ${musicTime(a.duration)}` : '0:00 / 0:00'}</p>
    <ol class="musList">${TRACKS.map((t, i) => `<li><button type="button" data-lab="musTrack" data-v="${i}" class="${i === music.n && a && a.src ? 'sel' : ''}"><i>${i === music.n && on ? '♪' : i + 1}</i><b>${esc(t)}</b></button></li>`).join('')}</ol>
    <div class="row"><a class="btn light" href="https://open.spotify.com/" target="_blank" rel="noopener">Ouvrir Spotify</a></div>
    ${labNote('Morceaux de démonstration, lus depuis cette page. Sur la peluche, la musique viendra des applications de musique du téléphone ou du forfait.')}`;
}
function openMusic() {
  labClear();
  focusEye();
  musicEye(); musicPanel();
}

// ---------- Gestes ----------

document.addEventListener('click', (event) => {
  const el = event.target.closest('[data-lab]');
  if (!el) return;
  const v = el.dataset.v;
  switch (el.dataset.lab) {
    case 'emo': return emoSet(v);
    case 'edition': return emoEditionSet(v);
    case 'qcolor': return (lab.qcolor = v), emoDraw(), emoPanel();
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
    case 'element': return (lab.element = v), coreDraw(), corePanel();
    case 'locate': return locateMe();
    case 'musToggle': return musicToggle();
    case 'musPrev': return musicPlay(music.n - 1);
    case 'musNext': return musicPlay(music.n + 1);
    case 'musTrack': return musicPlay(Number(v));
    case 'holoColor': return (lab.ambiance = v), holoDraw(), holoPanel();
  }
});
document.addEventListener('input', (event) => {
  const el = event.target;
  if (el.id === 'memoQ') $('#memoItems').innerHTML = memoryList(el.value);
  if (el.id === 'coreEnergy') {
    lab.energy = Number(el.value);
    const c = $('.core'); if (c) { c.style.setProperty('--e', (lab.energy / 100).toFixed(2)); c.style.setProperty('--t', (60 / coreBpm()).toFixed(3) + 's'); $('.core .emoTag b').textContent = coreBpm(); }
    $('#coreBpm').textContent = coreBpm(); $('#coreE').textContent = lab.energy; $('#coreFill').style.width = lab.energy + '%';
  }
  if (el.id === 'dreamLight') { lab.light = Number(el.value); $('.dream')?.style.setProperty('--l', lab.light / 100); }
});
document.addEventListener('change', (event) => {
  if (event.target.id === 'emoSolo') return setView(event.target.checked);
  if (event.target.id === 'emoNoBlink') { lab.blink = !event.target.checked; return emoDraw(); }
  if (event.target.id === 'linkFriend') { store.set('lien', event.target.value); openLink(); }
});
