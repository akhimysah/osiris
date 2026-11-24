// Jeux de l'œil : petits jeux écrits pour l'écran rond (tout tient dans le carré inscrit dans le cercle).
// Chargé avec app.js, dont il utilise screen, panel, state, store, backButton, focusEye et setScreen.
let gameRun = 0;
const GAME_LIST = [
  ['paires', 'Les paires', 'Retrouve les images qui vont ensemble.'],
  ['etoiles', 'Pluie d’étoiles', 'Glisse le doigt pour attraper les étoiles.'],
];
function gameBest(id) { return (store.get('jeux', {}) || {})[id]; }
function gameSave(id, value, lower) {
  const all = store.get('jeux', {}) || {};
  if (all[id] == null || (lower ? value < all[id] : value > all[id])) { all[id] = value; store.set('jeux', all); }
}
function openGames(options = {}) {
  gameRun++;
  if (options.game) return startGame(options.game);
  screen.innerHTML = `<div class="game pick"><small>Jeux</small>${GAME_LIST.map(([id, name]) => `<button type="button" data-jeu="${id}">${name}</button>`).join('')}</div>`;
  renderGames();
  focusEye();
}
function renderGames(note = '') {
  panel.innerHTML = `${backButton}<h2>Jeux</h2>
    <p>${note || 'Deux jeux pensés pour l’écran rond : ils se jouent du bout du doigt, directement dans l’œil.'}</p>
    <div class="row">${GAME_LIST.map(([id, name]) => `<button class="btn${state.game === id ? '' : ' light'}" type="button" data-jeu="${id}">${name}</button>`).join('')}</div>
    <ul class="muted">${GAME_LIST.map(([id, name, how]) => `<li><strong>${name}</strong> : ${how}${gameBest(id) != null ? ` Record : ${gameBest(id)} ${id === 'paires' ? 'coups' : 'étoiles'}.` : ''}</li>`).join('')}</ul>`;
}
function startGame(id) {
  gameRun++;
  state.game = id;
  focusEye();
  (id === 'paires' ? playPairs : playStars)(gameRun);
  renderGames(GAME_LIST.find((g) => g[0] === id)[2]);
}
function gameOver(title, line, id) {
  screen.innerHTML = `<div class="game pick"><small>${title}</small><b>${line}</b><button type="button" data-jeu="${id}">Rejouer</button><button type="button" data-jeu="">Autre jeu</button></div>`;
  renderGames(`${title} ${line}`);
}
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-jeu]');
  if (!button || state.screen !== 'games') return;
  if (button.dataset.jeu) startGame(button.dataset.jeu);
  else { state.game = null; openGames(); }
});

// --- Les paires : 12 cartes, 6 images ---
function playPairs(run) {
  const faces = ['🌙', '⭐', '🍎', '🐟', '🌸', '🚀'];
  const cards = [...faces, ...faces].sort(() => Math.random() - 0.5);
  let open = [], found = 0, moves = 0, lock = false;
  screen.innerHTML = `<div class="game pairs"><small id="pairsInfo">0 coup</small><div class="cards">${cards.map((face, i) => `<button type="button" data-card="${i}" aria-label="Carte ${i + 1}"><span>${face}</span></button>`).join('')}</div></div>`;
  const box = screen.querySelector('.cards');
  box.addEventListener('click', (event) => {
    const card = event.target.closest('[data-card]');
    if (!card || lock || run !== gameRun || card.classList.contains('on')) return;
    card.classList.add('on');
    open.push(card);
    if (open.length < 2) return;
    moves++;
    screen.querySelector('#pairsInfo').textContent = `${moves} coup${moves > 1 ? 's' : ''}`;
    const [a, b] = open;
    open = [];
    if (cards[a.dataset.card] === cards[b.dataset.card]) {
      a.classList.add('ok'); b.classList.add('ok');
      if (++found === faces.length) {
        gameSave('paires', moves, true);
        setTimeout(() => run === gameRun && gameOver('Bravo !', `${moves} coups`, 'paires'), 700);
      }
    } else {
      lock = true;
      setTimeout(() => { a.classList.remove('on'); b.classList.remove('on'); lock = false; }, 800);
    }
  });
}

// --- Pluie d'étoiles : 30 secondes pour en attraper le plus possible ---
function playStars(run) {
  screen.innerHTML = '<div class="game stars"><canvas></canvas><small id="starsInfo">0</small></div>';
  const canvas = screen.querySelector('canvas'), ctx = canvas.getContext('2d');
  const size = 480;
  canvas.width = canvas.height = size;
  let basket = size / 2, score = 0, last = performance.now(), spawn = 0;
  const end = last + 30000, stars = [];
  const move = (event) => {
    const box = canvas.getBoundingClientRect();
    basket = Math.max(110, Math.min(size - 110, ((event.clientX - box.left) / box.width) * size));
    event.preventDefault();
  };
  canvas.addEventListener('pointerdown', move);
  canvas.addEventListener('pointermove', move);
  const star = (x, y, r) => {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2, d = i % 2 ? r * 0.45 : r;
      ctx.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
    }
    ctx.closePath(); ctx.fill();
  };
  const frame = (now) => {
    if (run !== gameRun || state.screen !== 'games' || !canvas.isConnected) return;
    const dt = Math.min(50, now - last) / 1000;
    last = now;
    spawn -= dt;
    if (spawn <= 0) { stars.push({ x: 120 + Math.random() * (size - 240), y: 40, v: 150 + Math.random() * 90 + score * 3 }); spawn = 0.75; }
    const sky = ctx.createLinearGradient(0, 0, 0, size);
    sky.addColorStop(0, '#0b1230'); sky.addColorStop(1, '#2b3f7a');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#ffd24a';
    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i];
      s.y += s.v * dt;
      if (s.y > 372 && s.y < 410 && Math.abs(s.x - basket) < 46) { score++; stars.splice(i, 1); continue; }
      if (s.y > size) { stars.splice(i, 1); continue; }
      star(s.x, s.y, 17);
    }
    ctx.fillStyle = '#f4e8d2';
    ctx.beginPath(); ctx.roundRect(basket - 44, 384, 88, 30, 15); ctx.fill();
    screen.querySelector('#starsInfo').textContent = `${score} · ${Math.max(0, Math.ceil((end - now) / 1000))} s`;
    if (now >= end) { gameSave('etoiles', score); return gameOver('Fini !', `${score} étoile${score > 1 ? 's' : ''}`, 'etoiles'); }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
