// Histoires : une scène animée par histoire, dessinée pour l'œil rond. Les éléments marqués data-tap réagissent au toucher.
// Chargé avant app.js : ses fonctions n'utilisent screen, STORIES, L et esc qu'au moment de l'appel.

// Petit ourson BeyaBear’s (un seul grand œil), réutilisé dans les scènes. p = préfixe des dégradés.
const sceneBear = (p, hat = '') => `<g class="sBear">
  <circle cx="-9" cy="-10" r="5" fill="url(#${p}fur)"/><circle cx="9" cy="-10" r="5" fill="url(#${p}fur)"/>
  <circle cx="0" cy="0" r="12" fill="url(#${p}fur)"/>
  <circle cx="0" cy="-1" r="6.4" fill="#0b1026"/><circle cx="0" cy="-1" r="4.6" fill="#2e8bff"/><circle cx="0" cy="-1" r="2.3" fill="#061022"/><circle cx="1.6" cy="-2.6" r="1.1" fill="#fff"/>
  <path d="M-3 7q3 2.4 6 0" fill="none" stroke="#7a4a22" stroke-width="1.2" stroke-linecap="round"/>${hat}</g>`;
const sceneDefs = (p) => `<radialGradient id="${p}fur" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#f6d9a6"/><stop offset=".7" stop-color="#dfae6a"/><stop offset="1" stop-color="#b97f3e"/></radialGradient>`;
const WAVE = 'M0 0q12.5-7 25 0t25 0 25 0 25 0 25 0 25 0 25 0 25 0 25 0 25 0 25 0 25 0V60H0z';

const SCENES = [
  // 0 · Le bateau de la lune
  (p) => `<defs>${sceneDefs(p)}
    <linearGradient id="${p}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0e33"/><stop offset=".55" stop-color="#272c78"/><stop offset="1" stop-color="#5d4c9c"/></linearGradient>
    <radialGradient id="${p}moon" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#fffdf0"/><stop offset=".6" stop-color="#ffe9a3"/><stop offset="1" stop-color="#e6b356"/></radialGradient>
    <radialGradient id="${p}glow"><stop offset="0" stop-color="#fff2b3" stop-opacity=".6"/><stop offset="1" stop-color="#fff2b3" stop-opacity="0"/></radialGradient>
    <linearGradient id="${p}sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f6fd0"/><stop offset="1" stop-color="#14245e"/></linearGradient>
    <linearGradient id="${p}hull" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c98a4b"/><stop offset="1" stop-color="#7a4520"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#${p}sky)"/>
    <g class="sStars">${[[28, 30, 1.6], [62, 18, 1.2], [96, 40, 1.4], [44, 66, 1.1], [176, 96, 1.3], [20, 96, 1.2], [118, 14, 1], [80, 78, 1.2]].map(([x, y, r], i) => `<g data-tap="star" transform="translate(${x} ${y})"><circle r="7" fill="transparent"/><circle class="sTw" r="${r}" fill="#fff" style="animation-delay:${i * 0.37}s"/></g>`).join('')}</g>
    <g data-tap="moon" class="sMoon" transform="translate(142 54)"><circle r="48" fill="url(#${p}glow)"/><circle r="25" fill="url(#${p}moon)"/><circle cx="8" cy="-9" r="4" fill="#e9c574" opacity=".5"/><circle cx="-10" cy="8" r="3" fill="#e9c574" opacity=".45"/>
      <path d="M-11-2q3.5 3 7 0M4-2q3.5 3 7 0" fill="none" stroke="#9a6a26" stroke-width="1.5" stroke-linecap="round"/><path d="M-5 8q5 4 10 0" fill="none" stroke="#9a6a26" stroke-width="1.5" stroke-linecap="round"/></g>
    <path class="sWave back" d="${WAVE}" transform="translate(-40 112)" fill="#31529f" opacity=".8"/>
    <g data-tap="boat" class="sBoat" transform="translate(84 110)"><g class="sBob">
      <path d="M0-46v40" stroke="#6b3d1c" stroke-width="2.4" stroke-linecap="round"/><path d="M2-44q26 12 22 34H2z" fill="#fff6dd"/><path d="M-2-40q-16 12-14 30h14z" fill="#ffd98a"/>
      <g transform="translate(-12 -14) scale(.82)">${sceneBear(p)}</g>
      <path d="M-34-6h68q-4 20-20 20h-28q-16 0-20-20z" fill="url(#${p}hull)"/><path d="M-34-6h68" stroke="#e7b77c" stroke-width="2.4" stroke-linecap="round"/></g></g>
    <path class="sWave front" d="${WAVE.replace('V60', 'V90')}" transform="translate(-20 126)" fill="url(#${p}sea)"/>
    <ellipse class="sShine" cx="142" cy="138" rx="16" ry="2.6" fill="#fff2b3" opacity=".5"/>`,

  // 1 · L’explorateur du jardin
  (p) => `<defs>${sceneDefs(p)}
    <linearGradient id="${p}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#63c4ff"/><stop offset=".7" stop-color="#c9f1ff"/><stop offset="1" stop-color="#fff3c9"/></linearGradient>
    <radialGradient id="${p}sun" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fffbd1"/><stop offset="1" stop-color="#ffb62e"/></radialGradient>
    <linearGradient id="${p}h1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fdc6b"/><stop offset="1" stop-color="#3f9d45"/></linearGradient>
    <linearGradient id="${p}h2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fc95a"/><stop offset="1" stop-color="#1f7a3a"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#${p}sky)"/>
    <g data-tap="sun" class="sSun" transform="translate(46 44)"><g class="sRays">${Array.from({ length: 10 }, (_, i) => `<path d="M0-30v-9" stroke="#ffc94a" stroke-width="3.4" stroke-linecap="round" transform="rotate(${i * 36})"/>`).join('')}</g><circle r="21" fill="url(#${p}sun)"/><path d="M-8-3q3-3 6 0M2-3q3-3 6 0" fill="none" stroke="#b9741b" stroke-width="1.5" stroke-linecap="round"/><path d="M-6 6q6 5 12 0" fill="none" stroke="#b9741b" stroke-width="1.5" stroke-linecap="round"/></g>
    <g class="sDrift"><ellipse cx="146" cy="40" rx="20" ry="9" fill="#fff"/><ellipse cx="132" cy="44" rx="13" ry="7" fill="#fff"/><ellipse cx="160" cy="45" rx="12" ry="6" fill="#fff"/></g>
    <path d="M0 124q50-34 104-8t96-14v98H0z" fill="url(#${p}h1)"/>
    <g data-tap="bear" class="sPeek" transform="translate(140 108)"><g class="sHop">${sceneBear(p, '<path d="M-13-9q13-13 26 0z" fill="#c9a36a"/><path d="M-17-9h34" stroke="#a8824a" stroke-width="3" stroke-linecap="round"/>')}
      <g transform="translate(13 8) rotate(-20)"><circle r="6" fill="#bfe9ff" stroke="#6b4a24" stroke-width="2"/><path d="M4 5l6 7" stroke="#6b4a24" stroke-width="2.6" stroke-linecap="round"/></g></g></g>
    <path d="M0 160q46-22 96-6t104-12v58H0z" fill="url(#${p}h2)"/>
    ${[[24, 158, '#ff6b8b'], [42, 176, '#ffd23f'], [100, 150, '#b48cff'], [158, 176, '#ff8a3d'], [176, 158, '#ff6b8b']].map(([x, y, c], i) => `<g data-tap="flower" transform="translate(${x} ${y})"><g class="sSway" style="animation-delay:${-i * 0.6}s"><rect x="-9" y="-30" width="18" height="34" fill="transparent"/><path d="M0 0v-18" stroke="#1d6b33" stroke-width="2.2" stroke-linecap="round"/><path d="M0-8q7-5 9 1q-6 3-9-1" fill="#2e8f45"/><g class="sBloom" transform="translate(0 -20)">${Array.from({ length: 5 }, (_, k) => `<ellipse cx="0" cy="-5" rx="3.4" ry="5" fill="${c}" transform="rotate(${k * 72})"/>`).join('')}<circle r="2.8" fill="#fff4b8"/></g></g></g>`).join('')}
    <g class="sFly"><g data-tap="fly"><circle r="9" fill="transparent"/><g class="sFlap"><path d="M0 0q-9-10-11 0q2 8 11 0z" fill="#ff7ab8"/><path d="M0 0q9-10 11 0q-2 8-11 0z" fill="#ffa3d1"/></g><path d="M0-3v7" stroke="#5a2a4a" stroke-width="1.4" stroke-linecap="round"/></g></g>`,

  // 2 · Le nuage qui avait peur de pleuvoir
  (p) => `<defs>${sceneDefs(p)}
    <linearGradient id="${p}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4aa8f0"/><stop offset=".75" stop-color="#bfe6ff"/><stop offset="1" stop-color="#eafcff"/></linearGradient>
    <radialGradient id="${p}cl" cx=".4" cy=".25" r=".9"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#eaf2ff"/><stop offset="1" stop-color="#bcd0f2"/></radialGradient>
    <radialGradient id="${p}sun" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fffbd1"/><stop offset="1" stop-color="#ffb62e"/></radialGradient>
    <linearGradient id="${p}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fdc6b"/><stop offset="1" stop-color="#2f8a40"/></linearGradient></defs>
    <rect width="200" height="200" fill="url(#${p}sky)"/>
    <circle cx="164" cy="36" r="18" fill="url(#${p}sun)"/>
    <g class="sBow" fill="none" stroke-width="5">${['#ff5d5d', '#ffa53d', '#ffe14a', '#58d36b', '#4aa8f0', '#9b6bff'].map((c, i) => `<path d="M${22 + i * 5} 170a${78 - i * 5} ${78 - i * 5} 0 0 1 ${156 - i * 10} 0" stroke="${c}"/>`).join('')}</g>
    <path d="M0 162q52-22 100-8t100-10v56H0z" fill="url(#${p}h)"/>
    ${[[24, 162, '#ff6b8b'], [42, 178, '#ffd23f'], [158, 178, '#b48cff'], [176, 162, '#ff8a3d']].map(([x, y, c]) => `<g transform="translate(${x} ${y})"><g class="sGrow"><path d="M0 0v-14" stroke="#1d6b33" stroke-width="2.2" stroke-linecap="round"/><g transform="translate(0 -16)">${Array.from({ length: 5 }, (_, k) => `<ellipse cx="0" cy="-4.4" rx="3" ry="4.4" fill="${c}" transform="rotate(${k * 72})"/>`).join('')}<circle r="2.4" fill="#fff4b8"/></g></g></g>`).join('')}
    <g class="sRain" stroke="#4a8fe8" stroke-width="2.6" stroke-linecap="round">${Array.from({ length: 9 }, (_, i) => `<path d="M${62 + i * 10} 96v7" style="animation-delay:${-(i * 0.23) % 0.9}s"/>`).join('')}</g>
    <g data-tap="cloud" class="sCloud" transform="translate(100 72)"><g class="sFloat">
      <ellipse cx="0" cy="8" rx="50" ry="20" fill="url(#${p}cl)"/><circle cx="-26" cy="-4" r="20" fill="url(#${p}cl)"/><circle cx="4" cy="-16" r="26" fill="url(#${p}cl)"/><circle cx="30" cy="-2" r="18" fill="url(#${p}cl)"/>
      <ellipse cx="-20" cy="10" rx="6" ry="3.4" fill="#ffb3c7" opacity=".8"/><ellipse cx="22" cy="10" rx="6" ry="3.4" fill="#ffb3c7" opacity=".8"/>
      <g class="sEyes"><circle cx="-10" cy="2" r="3.4" fill="#1b2550"/><circle cx="12" cy="2" r="3.4" fill="#1b2550"/><circle cx="-9" cy=".8" r="1.1" fill="#fff"/><circle cx="13" cy=".8" r="1.1" fill="#fff"/></g>
      <path class="sWorry" d="M-5 13q6-4 12 0" fill="none" stroke="#1b2550" stroke-width="1.8" stroke-linecap="round"/><path class="sSmile" d="M-6 10q7 7 14 0" fill="none" stroke="#1b2550" stroke-width="1.8" stroke-linecap="round"/></g></g>`,
];
const sceneSvg = (i, p) => `<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${(SCENES[i % SCENES.length] || SCENES[0])(p)}</svg>`;

// Histoire en cours (-1 : aucune). L'œil garde la même scène d'une phrase à l'autre : seul le texte change.
let storyNow = -1;
function storyEye(text) {
  if (storyNow < 0) return false;
  let box = screen.querySelector(`.say.story[data-scene="${storyNow}"]`);
  if (!box) {
    screen.innerHTML = `<div class="say story" data-scene="${storyNow}"><div class="scene">${sceneSvg(storyNow, 'e' + storyNow)}</div><span></span></div>`;
    box = screen.firstElementChild;
  }
  box.querySelector('span').textContent = text;
  box.classList.toggle('long', text.length > 90);
  return true;
}
// Choix dans l'œil : trois bulles à toucher.
function storyPick() {
  storyNow = -1;
  screen.innerHTML = `<div class="storyPick"><small>${esc(L('Choisis une histoire.'))}</small>${STORIES.slice(0, 3).map((story, i) => `<button type="button" class="pick p${i}" data-story="${i}" aria-label="${esc(story.title)}">${sceneSvg(i, 'k' + i)}</button>`).join('')}</div>`;
}
const storyThumb = (i) => `<i class="storyThumb">${sceneSvg(i, 't' + i)}</i>`;

// Toucher un élément de la scène : il réagit, sans ouvrir le menu de l'œil.
document.addEventListener('click', (event) => {
  const el = event.target.closest && event.target.closest('.scene [data-tap]');
  if (!el) return;
  event.stopPropagation();
  event.preventDefault();
  if (el.dataset.tap === 'cloud') return el.closest('svg').classList.toggle('raining');
  el.classList.remove('tapped');
  void el.getBoundingClientRect();
  el.classList.add('tapped');
  setTimeout(() => el.classList.remove('tapped'), 1400);
}, true);

// Socle : toucher l'œil fait onduler la lumière.
document.addEventListener('click', (event) => {
  const holo = event.target.closest && event.target.closest('#screen .holo');
  if (!holo) return;
  holo.classList.remove('slosh');
  void holo.offsetWidth;
  holo.classList.add('slosh');
});
