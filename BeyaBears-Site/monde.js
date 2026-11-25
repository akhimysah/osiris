// Le globe des oursons : une vraie Terre (photo satellite NASA Blue Marble) qui tourne,
// avec chaque ourson de la collection posé sur son pays. On fait tourner le globe du doigt,
// on touche un ourson et sa fiche s'ouvre : tenue, plat, tradition.
(() => {
  'use strict';
  const host = document.querySelector('#carteMonde');
  if (!host) return;
  const T = (s) => (window.T ? window.T(s) : s);
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const P = [{"id": "maroc", "n": "Maroc", "t": "Tarbouche et djellaba de velours.", "h": "Salam !", "d": "Le tajine, le couscous du vendredi et le thé à la menthe versé de très haut.", "r": "L’hospitalité : on offre toujours le thé à l’invité. Les souks et les zelliges colorent les médinas.", "w": 900, "ht": 900, "lon": -6.5, "lat": 32}, {"id": "france", "n": "France", "t": "Béret, marinière et foulard rouge.", "h": "Bonjour !", "d": "La baguette, les fromages et les crêpes.", "r": "Le 14 juillet, on danse au bal et on regarde le feu d’artifice.", "w": 825, "ht": 1100, "lon": 2.5, "lat": 46.8}, {"id": "espagne", "n": "Espagne", "t": "Habit de lumière brodé d’or.", "h": "¡Hola!", "d": "La paella et les tapas à partager.", "r": "Le flamenco, ses guitares et ses claquements de mains. On dîne tard et la fête se fait dans la rue.", "w": 880, "ht": 1100, "lon": -3.7, "lat": 40}, {"id": "angleterre", "n": "Angleterre", "t": "Garde royal et bonnet à poils.", "h": "Hello!", "d": "Le fish and chips et le thé de l’après-midi avec des scones.", "r": "La relève de la garde devant le palais de Buckingham, à Londres.", "w": 880, "ht": 1100, "lon": -1.3, "lat": 52.6}, {"id": "usa", "n": "États-Unis", "t": "Blouson teddy et baskets étoilées.", "h": "Hi!", "d": "Les burgers, les pancakes et la tarte aux pommes.", "r": "Thanksgiving réunit toute la famille autour d’une dinde, en novembre.", "w": 880, "ht": 1100, "lon": -98, "lat": 39}, {"id": "canada", "n": "Canada", "t": "Chapka à carreaux et parka rouge.", "h": "Bonjour, hi!", "d": "La poutine et le sirop d’érable.", "r": "Le hockey sur glace, et au printemps la cabane à sucre.", "w": 880, "ht": 1100, "lon": -100, "lat": 56}, {"id": "bresil", "n": "Brésil", "t": "Chapeau de paille et maillot jaune.", "h": "Olá!", "d": "La feijoada : haricots noirs, riz et viande mijotée.", "r": "Le carnaval de Rio et la samba. Le football se joue partout, jusque sur la plage.", "w": 825, "ht": 1100, "lon": -51, "lat": -11}, {"id": "japon", "n": "Japon", "t": "Kimono brodé et fleurs de cerisier.", "h": "Konnichiwa!", "d": "Les sushis, les ramens et le thé vert matcha.", "r": "Au printemps, on pique-nique sous les cerisiers en fleurs : c’est le hanami.", "w": 900, "ht": 900, "lon": 138.5, "lat": 36.5}, {"id": "portugal", "n": "Portugal", "t": "Chapeau noir, gilet brodé et pastéis de nata.", "h": "Olá!", "d": "La morue (bacalhau) et les pastéis de nata.", "r": "Le fado, un chant plein d’émotion, et les azulejos, ces carreaux bleus et blancs.", "w": 900, "ht": 1125, "lon": -8.2, "lat": 39.6}, {"id": "colombie", "n": "Colombie", "t": "Sombrero vueltiao et écharpe tissée.", "h": "¡Hola!", "d": "La bandeja paisa, les arepas et un café réputé dans le monde entier.", "r": "La cumbia et le carnaval de Barranquilla.", "w": 900, "ht": 1125, "lon": -73.5, "lat": 4.5}, {"id": "coree", "n": "Corée du Sud", "t": "Hanbok rose et bleu, bibimbap à la main.", "h": "Annyeonghaseyo!", "d": "Le bibimbap et le kimchi.", "r": "Pour Chuseok, la fête des récoltes, les familles se retrouvent. On porte le hanbok aux grandes occasions.", "w": 900, "ht": 1125, "lon": 127.8, "lat": 36.3}, {"id": "senegal", "n": "Sénégal", "t": "Boubou blanc brodé d’or et thiéboudienne.", "h": "Nanga def ?", "d": "Le thiéboudienne, riz au poisson, et le jus de bissap.", "r": "La teranga, l’art d’accueillir. Les tambours sabar font danser tout le quartier.", "w": 900, "ht": 1125, "lon": -14.6, "lat": 14.6}, {"id": "allemagne", "n": "Allemagne", "t": "Culotte de peau, chapeau à plume et bretzel.", "h": "Hallo!", "d": "Les bretzels, les saucisses et le jus de pomme pétillant.", "r": "Les marchés de Noël illuminent les villes en décembre.", "w": 900, "ht": 1125, "lon": 10.4, "lat": 51}, {"id": "turquie", "n": "Turquie", "t": "Fez rouge, gilet brodé et baklavas.", "h": "Merhaba!", "d": "Les kebabs, les baklavas et le thé servi dans un verre tulipe.", "r": "Le hammam, le Grand Bazar et les derviches tourneurs.", "w": 900, "ht": 1125, "lon": 34.5, "lat": 39}, {"id": "italie", "n": "Italie", "t": "Foulard rouge, pizza et glace.", "h": "Ciao!", "d": "La pizza, les pâtes et le gelato.", "r": "Le repas du dimanche en famille, et le carnaval de Venise avec ses masques.", "w": 900, "ht": 1125, "lon": 12.6, "lat": 42.6}, {"id": "argentine", "n": "Argentine", "t": "Poncho de gaucho, empanadas et maté.", "h": "¡Hola!", "d": "L’asado, les empanadas et le maté que l’on partage.", "r": "Le tango est né à Buenos Aires. Les gauchos parcourent la pampa à cheval.", "w": 900, "ht": 1125, "lon": -64.5, "lat": -34}, {"id": "algerie", "n": "Algérie", "t": "Burnous blanc, couscous et thé à la menthe.", "h": "Salam !", "d": "Le couscous, la chorba et le thé à la menthe.", "r": "La musique chaâbi et le raï. Le burnous se porte aux grandes occasions.", "w": 900, "ht": 1125, "lon": 2.8, "lat": 29}, {"id": "ecosse", "n": "Écosse", "t": "Kilt en tartan et veste noire.", "h": "Halò!", "d": "Le haggis, servi avec une purée de navets et de pommes de terre.", "r": "La cornemuse et les jeux des Highlands. Chaque clan a son tartan.", "w": 900, "ht": 1125, "lon": -4.2, "lat": 57}, {"id": "chine", "n": "Chine", "t": "Veste rouge aux dragons dorés et raviolis vapeur.", "h": "Nǐ hǎo!", "d": "Le canard laqué de Pékin et les raviolis vapeur.", "r": "Le Nouvel An chinois : lanternes rouges, danse du dragon et grand repas de famille.", "w": 900, "ht": 1125, "lon": 104, "lat": 35}];
  const C = 5, R = 4, TW = 1024, TH = 512, RAD = Math.PI / 180;
  const TILT = 16 * RAD, cT = Math.cos(TILT), sT = Math.sin(TILT);

  host.className = 'globeBox';
  host.innerHTML = '<p class="globeHint"></p><div class="globe"><canvas aria-hidden="true"></canvas><svg class="globeLk" aria-hidden="true"></svg><div class="globePins">'
    + P.map((p, n) => '<button type="button" class="gpin" data-n="' + n + '" style="background-size:' + C * 100 + '% ' + R * 100 + '%;background-position:' + (n % C) / (C - 1) * 100 + '% ' + Math.floor(n / C) / (R - 1) * 100 + '%"><b></b></button>').join('')
    + '</div></div><p class="globeNow"><b></b><span></span></p>';
  const globe = host.querySelector('.globe'), cv = host.querySelector('canvas'), svg = host.querySelector('svg'), pins = [...host.querySelectorAll('.gpin')], now = host.querySelector('.globeNow');
  P.forEach((p) => { const la = p.lat * RAD; p.cl = Math.cos(la); p.sl = Math.sin(la); });

  // ---- Fiche d'un pays ----
  const box = document.createElement('dialog');
  box.className = 'paysBox';
  box.innerHTML = '<div class="pic"><img alt=""></div><div class="txt"><span class="hello"></span><h3></h3><dl><div><dt data-k="Sa tenue"></dt><dd data-f="t"></dd></div><div><dt data-k="À table"></dt><dd data-f="d"></dd></div><div><dt data-k="Tradition"></dt><dd data-f="r"></dd></div></dl>'
    + '<div class="paysNav"><button type="button" data-a="prev">‹</button><button type="button" class="x" data-a="close">×</button><button type="button" data-a="next">›</button></div></div>';
  document.body.appendChild(box);
  let cur = -1;
  const fill = () => {
    if (cur < 0) return;
    const p = P[cur], img = box.querySelector('img');
    img.src = 'media/pays/' + p.id + '.webp'; img.width = p.w; img.height = p.ht; img.alt = T('Ourson BeyaBear’s en tenue ' + p.n);
    box.querySelector('.hello').textContent = p.h; box.querySelector('h3').textContent = T(p.n);
    box.querySelectorAll('[data-f]').forEach((e) => { e.textContent = T(p[e.dataset.f]); });
    box.setAttribute('aria-label', T(p.n));
  };

  // ---- Le globe ----
  let lon0 = 5, target = null, drag = null, vel = 0, hold = 0, seen = false, raf = 0, tex = null, N = 0, map = null, out = null, last = 0, focus = -1;
  const img = new Image();
  img.onload = () => { const c = document.createElement('canvas'); c.width = TW; c.height = TH; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, TW, TH); try { tex = new Uint32Array(g.getImageData(0, 0, TW, TH).data.buffer); } catch (e) { tex = null; } kick(); };
  img.src = 'media/terre.jpg';

  // Pour chaque point du disque : quelle ligne et quelle colonne de la photo, et quelle lumière.
  const build = () => {
    const size = globe.clientWidth; if (size < 40) return false;
    N = Math.min(720, Math.round(size * Math.min(2, devicePixelRatio || 1)));
    cv.width = cv.height = N;
    const r = N / 2, list = [];
    for (let py = 0; py < N; py++) for (let px = 0; px < N; px++) {
      const x = (px + 0.5 - r) / r, y = -(py + 0.5 - r) / r, d = x * x + y * y; if (d >= 1) continue;
      const z = Math.sqrt(1 - d), Y = y * cT + z * sT, Z = -y * sT + z * cT;
      const row = Math.min(TH - 1, Math.floor((0.5 - Math.asin(Y) / Math.PI) * TH)), u = Math.round(Math.atan2(x, Z) / (2 * Math.PI) * TW);
      const ndl = Math.max(0, -0.42 * x + 0.46 * y + 0.78 * z), spec = Math.pow(Math.max(0, -0.3 * x + 0.34 * y + 0.89 * z), 26);
      const edge = Math.min(1, (1 - Math.sqrt(d)) * r / 1.4);
      list.push(py * N + px, row * TW, u, Math.round((0.34 + 0.86 * ndl) * (0.72 + 0.28 * z) * 256), Math.round(spec * 70 + (1 - z) * (1 - z) * 70), Math.round(edge * 255));
    }
    map = new Int32Array(list); out = cv.getContext('2d').createImageData(N, N);
    return true;
  };
  const paint = () => {
    if (!tex || !map) return;
    const d = new Uint32Array(out.data.buffer), off = Math.round(((lon0 + 180) / 360) * TW) + TW * 8;
    for (let i = 0; i < map.length; i += 6) {
      const c = tex[map[i + 1] + ((map[i + 2] + off) & (TW - 1))], s = map[i + 3], a = map[i + 4];
      let rr = ((c & 255) * s >> 8) + (a >> 1), gg = ((c >> 8 & 255) * s >> 8) + (a * 3 >> 2), bb = ((c >> 16 & 255) * s >> 8) + a;
      d[map[i]] = (map[i + 5] << 24) | ((bb > 255 ? 255 : bb) << 16) | ((gg > 255 ? 255 : gg) << 8) | (rr > 255 ? 255 : rr);
    }
    cv.getContext('2d').putImageData(out, 0, 0);
  };
  // Les oursons : posés sur leur pays, écartés juste ce qu'il faut pour ne pas se cacher, reliés à leur point.
  const place = () => {
    const size = globe.clientWidth, r = size / 2, ps = Math.max(30, Math.min(46, size * 0.085)), vis = [];
    P.forEach((p, n) => {
      const l = (p.lon - lon0) * RAD, X = p.cl * Math.sin(l), Z = p.cl * Math.cos(l), y = p.sl * cT - Z * sT, z = p.sl * sT + Z * cT;
      p.z = z; p.sx = r + X * r; p.sy = r - y * r; p.px = p.sx; p.py = p.sy - ps * 0.62;
      if (z > 0.16) vis.push(p); else pins[n].style.display = 'none';
    });
    for (let k = 0; k < 14; k++) for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) {
      const a = vis[i], b = vis[j], dx = b.px - a.px, dy = b.py - a.py, dist = Math.hypot(dx, dy) || 0.01, min = ps * 1.04;
      if (dist < min) { const m = (min - dist) / 2, ux = dx / dist, uy = dy / dist; a.px -= ux * m; a.py -= uy * m; b.px += ux * m; b.py += uy * m; }
    }
    let best = -1, bz = 0, lines = '';
    P.forEach((p, n) => {
      if (p.z <= 0.16) return;
      const b = pins[n], fade = Math.min(1, (p.z - 0.16) / 0.25);
      b.style.display = ''; b.style.width = b.style.height = ps.toFixed(1) + 'px'; b.style.opacity = fade.toFixed(2);
      b.style.transform = 'translate(' + (p.px - ps / 2).toFixed(1) + 'px,' + (p.py - ps / 2).toFixed(1) + 'px)'; b.style.zIndex = String(10 + Math.round(p.z * 50));
      lines += '<line x1="' + p.sx.toFixed(1) + '" y1="' + p.sy.toFixed(1) + '" x2="' + p.px.toFixed(1) + '" y2="' + p.py.toFixed(1) + '" opacity="' + fade.toFixed(2) + '"/><circle cx="' + p.sx.toFixed(1) + '" cy="' + p.sy.toFixed(1) + '" r="3.4" opacity="' + fade.toFixed(2) + '"/>';
      const score = p.z - Math.abs(p.sx - r) / r * 0.6; if (score > bz) { bz = score; best = n; }
    });
    svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size); svg.innerHTML = lines;
    const f = cur >= 0 && box.open ? cur : best;
    if (f !== focus) { focus = f; pins.forEach((b, n) => b.classList.toggle('on', n === f)); nowPaint(); }
  };
  const nowPaint = () => { if (focus < 0) return; now.querySelector('b').textContent = T(P[focus].n); now.querySelector('span').textContent = P[focus].h; };
  const frame = (t) => {
    raf = 0; if (!seen) return;
    if (!map && !build()) return;
    const dt = Math.min(60, t - (last || t)); last = t;
    if (target !== null) { let d = ((target - lon0 + 540) % 360) - 180; lon0 += d * Math.min(1, dt / 260); if (Math.abs(d) < 0.3) { lon0 = target; target = null; } }
    else if (!drag) { if (Math.abs(vel) > 0.002) { lon0 += vel * dt; vel *= Math.pow(0.94, dt / 16); } else if (!calm && t > hold && !box.open) lon0 -= dt * 0.006; }
    lon0 = ((lon0 + 540) % 360) - 180;
    paint(); place();
    const moving = target !== null || drag || Math.abs(vel) > 0.002 || (!calm && !box.open);
    if (moving) raf = requestAnimationFrame(frame);
  };
  function kick() { if (!raf && seen) { last = 0; raf = requestAnimationFrame(frame); } }
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { seen = e.isIntersecting; kick(); }, { rootMargin: '80px' }).observe(globe); else { seen = true; kick(); }
  addEventListener('resize', () => { map = null; kick(); });

  // On fait tourner la Terre du doigt ou de la souris.
  let moved = 0;
  globe.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, t: performance.now() }; moved = 0; vel = 0; target = null; kick(); });
  addEventListener('pointermove', (e) => { if (!drag) return; const dx = e.clientX - drag.x, now2 = performance.now(), k = 150 / globe.clientWidth; lon0 -= dx * k; vel = Math.max(-0.22, Math.min(0.22, -dx * k / Math.max(8, now2 - drag.t))); moved += Math.abs(dx); drag.x = e.clientX; drag.t = now2; kick(); }, { passive: true });
  const up = () => { if (!drag) return; drag = null; hold = performance.now() + 2600; kick(); };
  addEventListener('pointerup', up); addEventListener('pointercancel', up);

  const open = (n) => {
    cur = (n + P.length) % P.length; target = P[cur].lon; vel = 0; fill();
    if (!box.open) box.showModal();
    box.scrollTop = 0; kick();
  };
  pins.forEach((b) => b.addEventListener('click', () => { if (moved < 8) open(Number(b.dataset.n)); }));
  box.addEventListener('click', (e) => {
    if (e.target === box) return box.close();
    const a = e.target.closest('[data-a]'); if (!a) return;
    if (a.dataset.a === 'close') box.close(); else open(cur + (a.dataset.a === 'next' ? 1 : -1));
  });
  box.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') open(cur + 1); if (e.key === 'ArrowLeft') open(cur - 1); });
  box.addEventListener('close', () => { hold = performance.now() + 2600; focus = -2; kick(); });
  document.querySelectorAll('#railMonde .pays').forEach((fig) => {
    const im = fig.querySelector('img'), src = im ? im.getAttribute('src') : '', n = P.findIndex((p) => src.indexOf('/' + p.id + '.webp') >= 0);
    if (n < 0) return;
    fig.tabIndex = 0; fig.setAttribute('role', 'button');
    fig.addEventListener('click', () => open(n));
    fig.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(n); } });
  });
  const words = () => {
    host.querySelector('.globeHint').textContent = T('Faites tourner la Terre et touchez un ourson : il vous présente son pays.');
    pins.forEach((b, n) => { b.querySelector('b').textContent = T(P[n].n); b.setAttribute('aria-label', T(P[n].n)); });
    box.querySelectorAll('[data-k]').forEach((e) => { e.textContent = T(e.dataset.k); });
    box.querySelector('[data-a="prev"]').setAttribute('aria-label', T('Pays précédent')); box.querySelector('[data-a="next"]').setAttribute('aria-label', T('Pays suivant')); box.querySelector('[data-a="close"]').setAttribute('aria-label', T('Fermer'));
    fill(); nowPaint();
  };
  words(); document.addEventListener('langue', words);
})();
