// Briques de miel : un petit jeu de briques qui tombent, dans l'écran rond de la peluche.
// Dans la photo, le jeu se joue tout seul pour donner envie ; un toucher l'ouvre en grand pour jouer.
(() => {
  'use strict';
  const host = document.querySelector('.eyeGame');
  if (!host) return;
  const T = (s) => (window.T ? window.T(s) : s);
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLS = 10, ROWS = 16;
  const SHAPES = [[[1, 1, 1, 1]], [[1, 1], [1, 1]], [[0, 1, 0], [1, 1, 1]], [[1, 0, 0], [1, 1, 1]], [[0, 0, 1], [1, 1, 1]], [[1, 1, 0], [0, 1, 1]], [[0, 1, 1], [1, 1, 0]]];
  const COLORS = ['#ffd34d', '#ff9f1c', '#f25c54', '#4fb4ff', '#7ee081', '#c78bff', '#ff8fc7'];
  const turn = (m) => m[0].map((_, x) => m.map((r) => r[x]).reverse());

  function Game(canvas, auto) {
    const g = canvas.getContext('2d');
    let grid, piece, next, score, over, last = 0, acc = 0, raf = 0, plan = null, running = false;
    const fresh = () => { const k = Math.floor(Math.random() * SHAPES.length); return { k, m: SHAPES[k], x: 0, y: 0 }; };
    const fits = (m, x, y) => m.every((r, j) => r.every((c, i) => !c || (x + i >= 0 && x + i < COLS && y + j < ROWS && (y + j < 0 || !grid[y + j][x + i]))));
    const spawn = () => {
      piece = next || fresh(); next = fresh();
      piece.x = Math.floor((COLS - piece.m[0].length) / 2); piece.y = -1;
      if (!fits(piece.m, piece.x, piece.y + 1)) { over = true; if (auto) setTimeout(reset, 1400); }
      if (auto) { let m = piece.m; const r = Math.floor(Math.random() * 4); for (let i = 0; i < r; i++) m = turn(m); plan = { m, x: Math.floor(Math.random() * (COLS - m[0].length + 1)) }; }
    };
    function reset() { grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0)); score = 0; over = false; next = null; spawn(); paint(); }
    const lock = () => {
      piece.m.forEach((r, j) => r.forEach((c, i) => { if (c && piece.y + j >= 0) grid[piece.y + j][piece.x + i] = piece.k + 1; }));
      const keep = grid.filter((r) => r.some((c) => !c)), n = ROWS - keep.length;
      if (n) { score += n; grid = Array.from({ length: n }, () => Array(COLS).fill(0)).concat(keep); if (this.onScore) this.onScore(score); }
      spawn();
    };
    const move = (dx) => { if (!over && fits(piece.m, piece.x + dx, piece.y)) { piece.x += dx; paint(); } };
    const rotate = () => { if (over) return; const m = turn(piece.m); for (const dx of [0, -1, 1, -2, 2]) if (fits(m, piece.x + dx, piece.y)) { piece.m = m; piece.x += dx; return paint(); } };
    const down = () => { if (over) return false; if (fits(piece.m, piece.x, piece.y + 1)) { piece.y++; return true; } lock(); return false; };
    const drop = () => { if (over) return; while (fits(piece.m, piece.x, piece.y + 1)) piece.y++; lock(); paint(); };
    function paint() {
      const box = canvas.clientWidth; if (box < 10) return;
      const dpr = Math.min(2, devicePixelRatio || 1), s = Math.round(box * dpr); if (canvas.width !== s) canvas.width = canvas.height = s;
      const cell = s * 0.05, ox = s * 0.25, oy = s * 0.1;
      g.clearRect(0, 0, s, s);
      const bg = g.createRadialGradient(s / 2, s / 2, s * 0.1, s / 2, s / 2, s * 0.55); bg.addColorStop(0, '#16224d'); bg.addColorStop(1, '#050816'); g.fillStyle = bg; g.fillRect(0, 0, s, s);
      g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(ox, oy, cell * COLS, cell * ROWS);
      g.strokeStyle = 'rgba(127,210,255,.5)'; g.lineWidth = Math.max(1, s * 0.004); g.strokeRect(ox, oy, cell * COLS, cell * ROWS);
      const block = (x, y, k, a) => {
        if (y < 0) return; const px = ox + x * cell, py = oy + y * cell, p = cell * 0.08;
        g.globalAlpha = a || 1; g.fillStyle = COLORS[k]; g.beginPath();
        if (g.roundRect) g.roundRect(px + p, py + p, cell - 2 * p, cell - 2 * p, cell * 0.22); else g.rect(px + p, py + p, cell - 2 * p, cell - 2 * p);
        g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(px + cell * 0.22, py + cell * 0.2, cell * 0.3, cell * 0.14); g.globalAlpha = 1;
      };
      grid.forEach((r, y) => r.forEach((c, x) => { if (c) block(x, y, c - 1); }));
      if (!over && piece) {
        let gy = piece.y; while (fits(piece.m, piece.x, gy + 1)) gy++;
        piece.m.forEach((r, j) => r.forEach((c, i) => { if (c) { if (!auto) block(piece.x + i, gy + j, piece.k, 0.22); block(piece.x + i, piece.y + j, piece.k); } }));
      }
      g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '800 ' + (s * 0.075).toFixed(0) + 'px system-ui, sans-serif';
      g.fillText(String(score), s * 0.125, s * 0.52);
      g.font = '700 ' + (s * 0.03).toFixed(0) + 'px system-ui, sans-serif'; g.fillStyle = '#9fc4ff'; g.fillText(T('Lignes').toUpperCase(), s * 0.125, s * 0.44);
      if (next) { const m = next.m, c2 = cell * 0.62, nx = s * 0.875 - (m[0].length * c2) / 2, ny = s * 0.47; g.fillStyle = COLORS[next.k]; m.forEach((r, j) => r.forEach((c, i) => { if (c) g.fillRect(nx + i * c2 + 1, ny + j * c2 + 1, c2 - 2, c2 - 2); })); }
      if (over) { g.fillStyle = 'rgba(5,8,22,.78)'; g.fillRect(0, s * 0.38, s, s * 0.24); g.fillStyle = '#fff'; g.font = '800 ' + (s * 0.075).toFixed(0) + 'px system-ui, sans-serif'; g.fillText(T('Fini !'), s / 2, s * 0.525); }
    }
    const tick = (now) => {
      raf = 0; if (!running) return;
      const dt = Math.min(200, now - (last || now)); last = now; acc += dt;
      const every = auto ? 150 : Math.max(140, 620 - score * 22);
      if (acc >= every && !over) {
        acc = 0;
        if (auto && plan) { if (JSON.stringify(piece.m) !== JSON.stringify(plan.m)) { const m = turn(piece.m); if (fits(m, piece.x, piece.y)) piece.m = m; else plan.m = piece.m; } else if (piece.x < plan.x && fits(piece.m, piece.x + 1, piece.y)) piece.x++; else if (piece.x > plan.x && fits(piece.m, piece.x - 1, piece.y)) piece.x--; }
        down(); paint();
      }
      raf = requestAnimationFrame(tick);
    };
    this.start = () => { if (running) return; running = true; last = 0; if (!grid) reset(); paint(); if (!(auto && calm)) raf = requestAnimationFrame(tick); };
    this.stop = () => { running = false; cancelAnimationFrame(raf); raf = 0; };
    this.reset = () => { reset(); if (this.onScore) this.onScore(0); };
    this.left = () => move(-1); this.right = () => move(1); this.rotate = rotate; this.drop = drop;
    this.soft = () => { down(); paint(); };
    this.isOver = () => over;
  }

  // L'aperçu dans la photo : il joue tout seul tant qu'il est à l'écran.
  host.innerHTML = '<canvas aria-hidden="true"></canvas><b></b>';
  const label = host.querySelector('b'), demo = new Game(host.querySelector('canvas'), true);
  const words = () => { label.textContent = '▶ ' + T('Jouer'); host.setAttribute('aria-label', T('Jouer aux Briques de miel dans l’écran rond')); };
  words(); document.addEventListener('langue', words);
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => (e.isIntersecting ? demo.start() : demo.stop()), { rootMargin: '40px' }).observe(host); else demo.start();

  // Le jeu en grand, dans un écran rond.
  let box = null, game = null;
  const open = () => {
    if (!box) {
      box = document.createElement('dialog'); box.className = 'gameBox'; box.setAttribute('aria-label', 'Briques de miel');
      box.innerHTML = '<div class="gameTop"><b data-g="Briques de miel"></b><button type="button" class="round" data-a="close" aria-label="Fermer">×</button></div>'
        + '<div class="gameEye"><canvas></canvas></div>'
        + '<div class="gamePad"><button type="button" data-a="left" aria-label="Gauche">◀</button><button type="button" data-a="rotate" aria-label="Tourner">⟳</button><button type="button" data-a="right" aria-label="Droite">▶</button><button type="button" data-a="drop" class="wide" data-g="Poser"></button><button type="button" data-a="again" class="wide soft" data-g="Rejouer"></button></div>'
        + '<p class="gameTip" data-g="Touchez l’écran pour tourner, glissez pour déplacer."></p>';
      document.body.appendChild(box);
      const cv = box.querySelector('canvas'); game = new Game(cv, false);
      const tr = () => box.querySelectorAll('[data-g]').forEach((e) => { e.textContent = T(e.dataset.g); });
      tr(); document.addEventListener('langue', tr);
      box.addEventListener('click', (e) => { const a = e.target.closest('[data-a]'); if (!a) return; const k = a.dataset.a; if (k === 'close') return box.close(); if (k === 'again') return game.reset(); game[k](); });
      box.addEventListener('close', () => { game.stop(); demo.start(); });
      box.addEventListener('keydown', (e) => { const k = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'rotate', ArrowDown: 'soft', ' ': 'drop' }[e.key]; if (k) { e.preventDefault(); game[k](); } });
      // Au doigt : un toucher tourne, un glissé déplace, un glissé vers le bas pose.
      let sx = 0, sy = 0, moved = false, step = 0;
      cv.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; moved = false; step = cv.clientWidth / 14; cv.setPointerCapture(e.pointerId); });
      cv.addEventListener('pointermove', (e) => { if (!e.buttons && e.pointerType === 'mouse') return; const dx = e.clientX - sx; if (Math.abs(dx) >= step) { moved = true; dx > 0 ? game.right() : game.left(); sx = e.clientX; } });
      cv.addEventListener('pointerup', (e) => { if (e.clientY - sy > step * 3) return game.drop(); if (!moved) (game.isOver() ? game.reset() : game.rotate()); });
    }
    demo.stop(); box.showModal(); game.reset(); game.start(); box.querySelector('[data-a="rotate"]').focus({ preventScroll: true });
  };
  host.addEventListener('click', open);
})();
