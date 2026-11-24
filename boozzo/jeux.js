// Jeux de l'œil : petits jeux écrits pour l'écran rond (tout tient dans le carré inscrit dans le cercle).
// Chargé avec app.js, dont il utilise screen, panel, state, store, backButton, focusEye et setScreen.
let gameRun = 0;
const GAME_LIST = [
  ['miel', 'Course au miel', 'Touche l’écran pour sauter : attrape les pots de miel, évite les souches et les abeilles.'],
  ['paires', 'Les paires', 'Retrouve les images qui vont ensemble.'],
  ['etoiles', 'Pluie d’étoiles', 'Glisse le doigt pour attraper les étoiles.'],
  ['calcul', 'Calcul', 'Touche la bonne réponse, dix fois de suite.'],
  ['dessin', 'Dessin', 'Choisis une couleur et dessine avec le doigt.'],
];
function gameBest(id) { return (store.get('jeux', {}) || {})[id]; }
function gameSave(id, value, lower) {
  const all = store.get('jeux', {}) || {};
  if (all[id] == null || (lower ? value < all[id] : value > all[id])) { all[id] = value; store.set('jeux', all); }
}
function openGames(options = {}) {
  gameRun++;
  if (options.game) return startGame(options.game);
  screen.innerHTML = `<div class="game pick four"><small>${L('Jeux')}</small>${GAME_LIST.map(([id, name]) => `<button type="button" data-jeu="${id}">${L(name)}</button>`).join('')}</div>`;
  renderGames();
  focusEye();
}
function renderGames(note = '') {
  panel.innerHTML = `${L(backButton)}<h2>${L('Jeux')}</h2>
    <p>${note || L('Cinq jeux pensés pour l’écran rond : ils se jouent du bout du doigt, directement dans l’œil.')}</p>
    <div class="row">${GAME_LIST.map(([id, name]) => `<button class="btn${state.game === id ? '' : ' light'}" type="button" data-jeu="${id}">${L(name)}</button>`).join('')}</div>
    <ul class="muted">${GAME_LIST.map(([id, name, how]) => `<li><strong>${L(name)}</strong> : ${L(how)}${gameBest(id) != null ? ` ${L('Record')} : ${gameBest(id)} ${L({ miel: 'pots', paires: 'coups', etoiles: 'étoiles', calcul: 'sur 10' }[id])}.` : ''}</li>`).join('')}</ul>`;
}
function startGame(id) {
  gameRun++;
  state.game = id;
  focusEye();
  ({ miel: playHoney, paires: playPairs, etoiles: playStars, calcul: playMaths, dessin: playDraw })[id](gameRun);
  renderGames(L(GAME_LIST.find((g) => g[0] === id)[2]));
}
function gameOver(title, line, id) {
  screen.innerHTML = `<div class="game pick"><small>${L(title)}</small><b>${line}</b><button type="button" data-jeu="${id}">${L('Rejouer')}</button><button type="button" data-jeu="">${L('Autre jeu')}</button></div>`;
  renderGames(`${L(title)} ${line}`);
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
  screen.innerHTML = `<div class="game pairs"><small id="pairsInfo">0 ${L('coup')}</small><div class="cards">${cards.map((face, i) => `<button type="button" data-card="${i}" aria-label="Carte ${i + 1}"><span>${face}</span></button>`).join('')}</div></div>`;
  const box = screen.querySelector('.cards');
  box.addEventListener('click', (event) => {
    const card = event.target.closest('[data-card]');
    if (!card || lock || run !== gameRun || card.classList.contains('on')) return;
    card.classList.add('on');
    open.push(card);
    if (open.length < 2) return;
    moves++;
    screen.querySelector('#pairsInfo').textContent = `${moves} ${L(moves > 1 ? 'coups' : 'coup')}`;
    const [a, b] = open;
    open = [];
    if (cards[a.dataset.card] === cards[b.dataset.card]) {
      a.classList.add('ok'); b.classList.add('ok');
      if (++found === faces.length) {
        gameSave('paires', moves, true);
        setTimeout(() => run === gameRun && gameOver('Bravo !', `${moves} ${L('coups')}`, 'paires'), 700);
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
    if (now >= end) { gameSave('etoiles', score); return gameOver('Fini !', `${score} ${L(score > 1 ? 'étoiles' : 'étoile')}`, 'etoiles'); }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// --- Calcul : dix additions et soustractions, trois réponses au choix ---
function playMaths(run) {
  let round = 0, good = 0;
  const next = () => {
    if (run !== gameRun) return;
    if (round === 10) { gameSave('calcul', good); return gameOver('Bravo !', `${good} ${L('sur 10')}`, 'calcul'); }
    round++;
    const plus = Math.random() < 0.6;
    let a = 1 + Math.floor(Math.random() * 9), b = 1 + Math.floor(Math.random() * 9);
    if (!plus && b > a) [a, b] = [b, a];
    const answer = plus ? a + b : a - b;
    const choices = new Set([answer]);
    while (choices.size < 3) { const c = answer + Math.floor(Math.random() * 7) - 3; if (c >= 0 && c !== answer) choices.add(c); }
    screen.innerHTML = `<div class="game maths"><small>${round} / 10</small><b>${a} ${plus ? '+' : '−'} ${b} = ?</b><div class="answers">${[...choices].sort(() => Math.random() - 0.5).map((c) => `<button type="button" data-answer="${c}">${c}</button>`).join('')}</div></div>`;
    screen.querySelector('.answers').addEventListener('click', (event) => {
      const button = event.target.closest('[data-answer]');
      if (!button || run !== gameRun || screen.querySelector('.right')) return;
      const right = Number(button.dataset.answer) === answer;
      if (right) good++;
      button.classList.add(right ? 'right' : 'wrong');
      screen.querySelector(`[data-answer="${answer}"]`).classList.add('right');
      setTimeout(next, 900);
    });
  };
  next();
}

// --- Dessin : six couleurs, on dessine avec le doigt ---
function playDraw(run) {
  const colors = ['#ffffff', '#ffd24a', '#ff5a6e', '#58b6ff', '#7ddc7a', '#c08bff'];
  screen.innerHTML = `<div class="game draw"><canvas></canvas><div class="inks">${colors.map((c, i) => `<button type="button" data-ink="${c}" style="background:${c}" aria-label="Couleur ${i + 1}"${i === 1 ? ' class="sel"' : ''}></button>`).join('')}<button type="button" data-ink="" aria-label="Tout effacer">×</button></div></div>`;
  const canvas = screen.querySelector('canvas'), ctx = canvas.getContext('2d');
  canvas.width = canvas.height = 480;
  ctx.lineWidth = 12; ctx.lineCap = ctx.lineJoin = 'round'; ctx.strokeStyle = colors[1];
  let down = false;
  const at = (event) => { const box = canvas.getBoundingClientRect(); return [((event.clientX - box.left) / box.width) * 480, ((event.clientY - box.top) / box.height) * 480]; };
  canvas.addEventListener('pointerdown', (event) => { down = true; ctx.beginPath(); ctx.moveTo(...at(event)); ctx.lineTo(...at(event)); ctx.stroke(); event.preventDefault(); });
  canvas.addEventListener('pointermove', (event) => { if (!down) return; ctx.lineTo(...at(event)); ctx.stroke(); event.preventDefault(); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((name) => canvas.addEventListener(name, () => (down = false)));
  screen.querySelector('.inks').addEventListener('click', (event) => {
    const button = event.target.closest('[data-ink]');
    if (!button) return;
    if (!button.dataset.ink) return ctx.clearRect(0, 0, 480, 480);
    ctx.strokeStyle = button.dataset.ink;
    screen.querySelectorAll('.inks .sel').forEach((b) => b.classList.remove('sel'));
    button.classList.add('sel');
  });
}

// --- Course au miel : l'ourson court tout seul, on touche l'écran pour sauter (deux sauts possibles). ---
function playHoney(run) {
  screen.innerHTML = '<div class="game honey"><canvas></canvas></div>';
  const canvas = screen.querySelector('canvas'), ctx = canvas.getContext('2d');
  const S = 480, GROUND = 352, X = 150;
  canvas.width = canvas.height = S;
  let y = GROUND, vy = 0, jumps = 0, score = 0, lives = 3, hurt = 0, speed = 230, dist = 0, last = performance.now(), nextAt = 300, started = false;
  const things = [], puffs = [];
  const jump = (event) => {
    event.preventDefault();
    started = true;
    if (jumps < 2) { vy = jumps ? -520 : -610; jumps++; }
  };
  canvas.addEventListener('pointerdown', jump);
  const addWave = () => {
    const kind = Math.random();
    const at = S + 40;
    if (kind < 0.34) { // souche avec un arc de pots au-dessus
      things.push({ t: 'log', x: at + 60, y: GROUND, w: 34, h: 34 });
      [[0, 300], [40, 250], [80, 225], [120, 250], [160, 300]].forEach(([dx, py]) => things.push({ t: 'pot', x: at + dx - 20, y: py }));
      nextAt = 330;
    } else if (kind < 0.6) { // abeille basse : on saute par-dessus, pots en hauteur
      things.push({ t: 'bee', x: at + 60, y: 308, w: 30, h: 24, p: Math.random() * 6 });
      [[20, 200], [60, 185], [100, 200]].forEach(([dx, py]) => things.push({ t: 'pot', x: at + dx, y: py }));
      nextAt = 300;
    } else if (kind < 0.8) { // abeille haute : il ne faut pas sauter, pots au sol
      things.push({ t: 'bee', x: at + 70, y: 235, w: 30, h: 24, p: Math.random() * 6 });
      [0, 45, 90, 135].forEach((dx) => things.push({ t: 'pot', x: at + dx, y: 318 }));
      nextAt = 290;
    } else { // ligne de pots tranquille
      [0, 45, 90, 135, 180].forEach((dx, i) => things.push({ t: 'pot', x: at + dx, y: i % 2 ? 270 : 318 }));
      nextAt = 280;
    }
  };
  const pot = (px, py) => {
    ctx.fillStyle = '#ffb21f'; ctx.beginPath(); ctx.roundRect(px - 11, py - 10, 22, 22, 7); ctx.fill();
    ctx.fillStyle = '#7a4a12'; ctx.fillRect(px - 9, py - 15, 18, 6);
    ctx.fillStyle = '#fff3'; ctx.fillRect(px - 7, py - 6, 4, 10);
  };
  const bear = (by, t) => {
    const air = by < GROUND - 2, leg = air ? 0 : Math.sin(t * 16) * 9;
    if (hurt > 0 && Math.floor(hurt * 12) % 2) return;
    ctx.fillStyle = '#1b2a66'; // jambes
    ctx.fillRect(X - 13 + leg, by - 16, 11, 16); ctx.fillRect(X + 2 - leg, by - 16, 11, 16);
    ctx.fillStyle = '#f4e8d2'; ctx.beginPath(); ctx.roundRect(X - 19, by - 46, 38, 34, 10); ctx.fill(); // sweat
    ctx.fillStyle = '#e8b97a'; // tête et oreilles
    ctx.beginPath(); ctx.arc(X - 16, by - 76, 9, 0, 7); ctx.arc(X + 16, by - 76, 9, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(X, by - 62, 23, 0, 7); ctx.fill();
    ctx.fillStyle = '#1b2a66'; ctx.beginPath(); ctx.arc(X, by - 68, 23, Math.PI, 0); ctx.fill(); ctx.fillRect(X + 4, by - 70, 26, 5); // casquette
    ctx.fillStyle = '#05070d'; ctx.beginPath(); ctx.arc(X + 3, by - 58, 12, 0, 7); ctx.fill(); // œil écran
    ctx.strokeStyle = '#2e8bff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X + 3, by - 58, 7, 0, 7); ctx.stroke();
  };
  const frame = (now) => {
    if (run !== gameRun || state.screen !== 'games' || !canvas.isConnected) return;
    const dt = Math.min(40, now - last) / 1000, t = now / 1000;
    last = now;
    if (started) {
      speed = Math.min(430, speed + dt * 5);
      dist += speed * dt; nextAt -= speed * dt;
      if (nextAt <= 0) addWave();
      vy += 1700 * dt; y += vy * dt;
      if (y >= GROUND) { y = GROUND; vy = 0; jumps = 0; }
      hurt = Math.max(0, hurt - dt);
    }
    // décor : ciel, soleil, collines, sol
    const sky = ctx.createLinearGradient(0, 0, 0, S);
    sky.addColorStop(0, '#7cc8ff'); sky.addColorStop(0.7, '#ffe2a8');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = '#fff6c9'; ctx.beginPath(); ctx.arc(350, 120, 34, 0, 7); ctx.fill();
    ctx.fillStyle = '#8fd08a';
    for (let i = -1; i < 4; i++) { const hx = i * 220 - ((dist * 0.25) % 220); ctx.beginPath(); ctx.ellipse(hx + 110, GROUND + 10, 150, 80, 0, Math.PI, 0); ctx.fill(); }
    ctx.fillStyle = '#4f9a4a'; ctx.fillRect(0, GROUND, S, S - GROUND);
    ctx.fillStyle = '#3c7d39';
    for (let i = -1; i < 14; i++) ctx.fillRect(i * 40 - (dist % 40), GROUND, 18, 6);
    // pots, souches, abeilles
    for (let i = things.length - 1; i >= 0; i--) {
      const o = things[i];
      if (started) o.x -= speed * dt;
      if (o.x < -60) { things.splice(i, 1); continue; }
      if (o.t === 'pot') {
        if (Math.abs(o.x - X) < 26 && o.y > y - 88 && o.y < y + 6) { score++; puffs.push({ x: o.x, y: o.y, a: 1 }); things.splice(i, 1); continue; }
        pot(o.x, o.y + Math.sin(t * 5 + o.x / 30) * 3);
      } else {
        const oy = o.t === 'bee' ? o.y + Math.sin(t * 6 + o.p) * 8 : o.y;
        if (o.t === 'log') { ctx.fillStyle = '#7a4a22'; ctx.beginPath(); ctx.roundRect(o.x - 17, oy - o.h, 34, o.h, 6); ctx.fill(); ctx.fillStyle = '#c99a5b'; ctx.beginPath(); ctx.ellipse(o.x, oy - o.h, 17, 6, 0, 0, 7); ctx.fill(); }
        else { ctx.fillStyle = '#ffffffb0'; ctx.beginPath(); ctx.ellipse(o.x - 2, oy - 22, 10, 7, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#ffcf2e'; ctx.beginPath(); ctx.ellipse(o.x, oy - 12, 15, 11, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#2b2118'; ctx.fillRect(o.x - 5, oy - 22, 4, 20); ctx.fillRect(o.x + 4, oy - 21, 4, 18); }
        const top = oy - o.h, hit = Math.abs(o.x - X) < o.w / 2 + 13 && y > top + 6 && y - 80 < oy - 2;
        if (hit && hurt <= 0 && started) { lives--; hurt = 1.2; if (lives <= 0) { gameSave('miel', score); return gameOver('Fini !', `${score} ${L(score > 1 ? 'pots de miel' : 'pot de miel')}`, 'miel'); } }
      }
    }
    for (let i = puffs.length - 1; i >= 0; i--) { const p = puffs[i]; p.a -= dt * 2.4; p.y -= 60 * dt; if (p.a <= 0) { puffs.splice(i, 1); continue; } ctx.fillStyle = `rgba(255,255,255,${p.a})`; ctx.font = '700 20px system-ui'; ctx.textAlign = 'center'; ctx.fillText('+1', p.x, p.y); }
    bear(y, started ? t : 0);
    // affichage : pots et vies, dans la partie large du rond
    ctx.textAlign = 'center'; ctx.fillStyle = '#10131c'; ctx.font = '800 30px system-ui';
    pot(205, 84); ctx.fillStyle = '#10131c'; ctx.fillText(String(score), 245, 94);
    for (let i = 0; i < 3; i++) { ctx.fillStyle = i < lives ? '#e5484d' : '#0003'; ctx.beginPath(); ctx.arc(216 + i * 24, 122, 8, 0, 7); ctx.fill(); }
    if (!started) { ctx.fillStyle = '#10131c'; ctx.font = '700 24px system-ui'; ctx.fillText(L('Touche pour sauter'), S / 2, 200); }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
