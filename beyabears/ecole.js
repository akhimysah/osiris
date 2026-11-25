// Éducation Beya : de petits exercices à toucher dans l'œil (calcul et couleurs). Chaque bonne réponse donne une étoile.
// Chargé avant app.js : ses fonctions n'utilisent store, screen, panel… qu'au moment de l'appel.

const EDU_COLORS = [['rouge', '#ef4444'], ['bleu', '#3b82f6'], ['vert', '#22c55e'], ['jaune', '#facc15'], ['orange', '#fb923c'], ['violet', '#a855f7'], ['rose', '#f472b6']];
const edu = { mode: 'calcul', level: 1, q: null, streak: 0, busy: false };
const eduStars = () => store.get('eduStars', 0);
const rnd = (n) => Math.floor(Math.random() * n);
const shuffle = (list) => list.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

function eduNew() {
  if (edu.mode === 'couleurs') {
    const picks = shuffle(EDU_COLORS).slice(0, 4), good = picks[rnd(4)];
    edu.q = { kind: 'couleurs', ask: good[0], good: good[1], choices: picks.map(([, c]) => c) };
  } else {
    const max = edu.level === 1 ? 10 : 20, minus = edu.level === 2 && Math.random() < 0.45;
    let a = 1 + rnd(max - 1), b = 1 + rnd(max - 1);
    if (minus) { if (b > a) [a, b] = [b, a]; } else if (a + b > max) b = Math.max(1, max - a);
    const good = minus ? a - b : a + b, wrong = new Set();
    while (wrong.size < 2) { const w = good + (rnd(2) ? 1 : -1) * (1 + rnd(3)); if (w >= 0 && w !== good) wrong.add(w); }
    edu.q = { kind: 'calcul', ask: `${a} ${minus ? '−' : '+'} ${b}`, good, choices: shuffle([good, ...wrong]) };
  }
  edu.busy = false;
  eduDraw();
}
function eduDraw() {
  const q = edu.q;
  screen.innerHTML = `<div class="edu e-${q.kind}"><span class="eduStars">★ ${eduStars()}</span>
    ${q.kind === 'calcul' ? `<b class="eduAsk">${q.ask}</b>` : `<small>Touche la couleur</small><b class="eduAsk word">${q.ask}</b>`}
    <div class="eduChoices">${q.choices.map((c) => (q.kind === 'calcul' ? `<button type="button" data-edu="${c}">${c}</button>` : `<button type="button" data-edu="${c}" style="background:${c}" aria-label="${(EDU_COLORS.find(([, x]) => x === c) || [])[0]}"></button>`)).join('')}</div></div>`;
}
function eduPanel() {
  const stars = eduStars(), badges = Math.floor(stars / 10), left = 10 - (stars % 10);
  panel.innerHTML = `${backButton}<span class="pill">Éducation Beya</span><h2>Apprendre en s’amusant</h2>
    <p>Réponds dans l’œil : chaque bonne réponse donne une étoile, et dix étoiles donnent une médaille.</p>
    <div class="eduBoard"><div><b>★ ${stars}</b><span>étoiles</span></div><div><b>${badges}</b><span>médailles</span></div><div><b>${edu.streak}</b><span>à la suite</span></div></div>
    <div class="storeBar" style="--p:${(stars % 10) * 10}"><span>Prochaine médaille</span><b>${left}</b><i></i></div>
    <h3 class="sub">Choisir <em>le jeu</em></h3>
    <div class="row wrap"><button class="btn${edu.mode === 'calcul' ? '' : ' light'}" type="button" data-edu-mode="calcul">Calcul</button><button class="btn${edu.mode === 'couleurs' ? '' : ' light'}" type="button" data-edu-mode="couleurs">Couleurs</button></div>
    ${edu.mode === 'calcul' ? `<div class="row wrap"><button class="btn${edu.level === 1 ? '' : ' light'}" type="button" data-edu-level="1">Facile</button><button class="btn${edu.level === 2 ? '' : ' light'}" type="button" data-edu-level="2">Plus dur</button></div>` : ''}
    <p class="muted">Facile : additions jusqu’à 10. Plus dur : additions et soustractions jusqu’à 20.</p>`;
}
function openEdu() {
  focusEye();
  edu.streak = 0;
  eduPanel();
  eduNew();
}
document.addEventListener('click', (event) => {
  const b = event.target.closest && event.target.closest('button');
  if (!b) return;
  if (b.dataset.eduMode) { edu.mode = b.dataset.eduMode; eduPanel(); return eduNew(); }
  if (b.dataset.eduLevel) { edu.level = Number(b.dataset.eduLevel); eduPanel(); return eduNew(); }
  if (!('edu' in b.dataset) || edu.busy || !edu.q) return;
  event.stopPropagation();
  const right = String(edu.q.good) === b.dataset.edu;
  if (!right) { edu.streak = 0; b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); if (typeof pop === 'function') pop(220, 160); return; }
  edu.busy = true;
  edu.streak++;
  store.set('eduStars', eduStars() + 1);
  b.classList.add('yes');
  const box = screen.querySelector('.edu');
  box.classList.add('won');
  box.querySelector('.eduStars').textContent = `★ ${eduStars()}`;
  if (typeof pop === 'function') pop(700, 90), setTimeout(() => pop(990, 160), 110);
  if (typeof confetti === 'function') confetti(box, eduStars() % 10 === 0 ? 30 : 12);
  if (eduStars() % 10 === 0) toast('Bravo ! Une nouvelle médaille.');
  eduPanel();
  setTimeout(() => state.screen === 'edu' && eduNew(), 1000);
}, true);
