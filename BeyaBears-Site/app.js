(() => {
  const T = window.T || ((s) => s);
  document.documentElement.classList.add('js');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Apparition douce des blocs
  const blocks = $$('.rise');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((list) => list.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('seen'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    blocks.forEach((b) => io.observe(b));
  } else blocks.forEach((b) => b.classList.add('seen'));

  // Son du site. Aucun navigateur ne laisse une page lancer du son sans un toucher : l'écran d'entrée fournit ce toucher.
  // Ensuite, la vidéo la plus proche du centre de l'écran joue avec le son, les autres tournent en silence.
  let sonOn = false, sonHold = false;
  const ambient = $$('video').filter((v) => !v.closest('.talk'));
  const sonToggle = $('#sonToggle'), gate = $('#gate');
  ambient.forEach((v) => { v.muted = true; v.defaultMuted = true; v.loop = true; v.removeAttribute('autoplay'); });
  const inView = (v) => { if (!v.offsetParent) return false; const r = v.getBoundingClientRect(); return r.bottom > innerHeight * 0.15 && r.top < innerHeight * 0.85; };
  const sonCurrent = () => {
    let best = null, dist = 1e9;
    ambient.forEach((v) => { if (!inView(v) || v.dataset.stopped) return; const r = v.getBoundingClientRect(), d = Math.abs((r.top + r.bottom) / 2 - innerHeight / 2); if (d < dist) { dist = d; best = v; } });
    return best;
  };
  const sonPaint = () => {
    if (!sonToggle) return;
    sonToggle.setAttribute('aria-pressed', String(sonOn));
    $('span', sonToggle).textContent = T(sonOn ? 'Son activé' : 'Son coupé');
  };
  const sonSync = () => {
    if (calm) return;
    const cur = sonCurrent();
    ambient.forEach((v) => {
      if (!inView(v) || v.dataset.stopped) { if (!v.paused) v.pause(); v.muted = true; return; }
      const loud = sonOn && !sonHold && v === cur && !('silent' in v.dataset);
      v.muted = !loud; v.volume = 1;
      if (v.paused) v.play().catch(() => {
        // Son refusé par le navigateur : on continue en silence et le bouton clignote pour le demander.
        v.muted = true; v.play().catch(() => {});
        if (loud && sonToggle) sonToggle.classList.add('ask');
      });
    });
  };
  // iPhone n'autorise le son que sur les vidéos lancées pendant un toucher : on les lance toutes à ce moment-là.
  const sonUnlock = () => {
    const cur = sonCurrent();
    ambient.forEach((v) => {
      if (!v.offsetParent || 'silent' in v.dataset) return;
      const wasPaused = v.paused;
      v.muted = false;
      const p = v.play();
      if (p && p.then) p.then(() => { if (v !== cur) { v.muted = true; if (wasPaused && !inView(v)) v.pause(); } }).catch(() => { v.muted = true; });
    });
  };
  const sonSet = (on) => { sonOn = on; if (sonToggle) sonToggle.classList.remove('ask'); if (on) sonUnlock(); sonPaint(); sonSync(); };
  if (sonToggle) sonToggle.addEventListener('click', () => sonSet(!sonOn));
  const gateClose = (on) => { gate.hidden = true; document.documentElement.style.overflow = ''; if (sonToggle) sonToggle.hidden = false; sonSet(on); };
  if (gate) {
    if (calm) { gate.hidden = true; }
    else {
      document.documentElement.style.overflow = 'hidden';
      $('#gateOn').addEventListener('click', () => gateClose(true));
      $('#gateOff').addEventListener('click', () => gateClose(false));
    }
  }
  let sonTick = false;
  const sonLater = () => { if (sonTick) return; sonTick = true; requestAnimationFrame(() => { sonTick = false; sonSync(); }); };
  addEventListener('scroll', sonLater, { passive: true });
  addEventListener('resize', sonLater);
  document.addEventListener('langue', () => { sonPaint(); sonSync(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) ambient.forEach((v) => v.pause()); else sonSync(); });
  sonPaint();
  if (gate && gate.hidden) sonSync();

  // Clips parlants : un par langue. Le son ne peut démarrer qu'après un toucher, d'où le grand bouton.
  const talks = $$('.talk');
  const talkStop = (box) => { const v = $('video', box); v.pause(); box.classList.remove('playing'); if (sonHold) { sonHold = false; sonSync(); } const lb = $('[data-listen]', box); lb.textContent = T(lb.dataset.label); };
  talks.forEach((box) => {
    const v = $('video', box), btn = $('[data-listen]', box);
    v.dataset.talk = '1';
    btn.addEventListener('click', () => {
      if (box.classList.contains('playing')) return talkStop(box);
      sonHold = true; sonSync();
      v.muted = false; v.volume = 1; v.currentTime = 0;
      v.play().then(() => { box.classList.add('playing'); btn.textContent = T('Arrêter'); }).catch(() => { v.controls = true; });
    });
    v.addEventListener('ended', () => talkStop(box));
  });
  document.addEventListener('langue', () => talks.forEach(talkStop));
  const filmBtn = $('#filmToggle'), film = $('#filmVideo');
  if (filmBtn && film) {
    const paint = () => { filmBtn.textContent = T(film.paused ? 'Lire' : 'Pause'); };
    filmBtn.addEventListener('click', () => {
      if (film.paused) { delete film.dataset.stopped; sonSync(); }
      else { film.dataset.stopped = '1'; film.pause(); sonSync(); }
    });
    film.addEventListener('play', paint); film.addEventListener('pause', paint); paint();
  }

  // L'œil : un mode à la fois
  const HALO = { iris: '#2e8bff', call: '#5c7cff', story: '#8a6bff', talk: '#2e8bff', video: '#ff7a59', meteo: '#6fc3ff', clock: '#ff5a4a', jeu: '#ffb21f', night: '#ffb347' };
  const modes = $$('.mode'), ball = $('.eyeball');
  let current = 0, timer = null, touched = false;
  function show(i) {
    current = (i + modes.length) % modes.length;
    const name = modes[current].dataset.view;
    modes.forEach((m, k) => m.setAttribute('aria-selected', k === current ? 'true' : 'false'));
    $$('.view').forEach((v) => v.classList.toggle('on', v.dataset.view === name));
    ball.style.setProperty('--halo', HALO[name] || HALO.iris);
  }
  modes.forEach((m, k) => {
    m.addEventListener('click', () => { touched = true; clearInterval(timer); show(k); });
  });
  if (modes.length) {
    show(0);
    if (!calm && 'IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        clearInterval(timer);
        if (e.isIntersecting && !touched) timer = setInterval(() => show(current + 1), 3600);
      }, { threshold: .4 }).observe(ball);
    }
  }
  const clock = $('#clockNow');
  if (clock) {
    const tick = () => { const d = new Date(); clock.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
    tick(); setInterval(tick, 15000);
  }

  // Rail des compagnons
  const rail = $('.rail');
  $$('[data-rail]').forEach((b) => b.addEventListener('click', () => {
    const step = (rail.querySelector('.card').offsetWidth + 18) * Number(b.dataset.rail);
    rail.scrollBy({ left: step, behavior: calm ? 'auto' : 'smooth' });
  }));

  // Coloris
  const bear = $('.bear'), toneName = $('#toneName');
  $$('.swatch').forEach((s) => s.addEventListener('click', () => {
    $$('.swatch').forEach((o) => o.setAttribute('aria-pressed', o === s ? 'true' : 'false'));
    bear.style.setProperty('--tone-fur', s.dataset.fur);
    bear.style.setProperty('--tone-edge', s.dataset.edge);
    bear.style.setProperty('--tone-eye', s.dataset.eye);
    toneName.textContent = s.textContent.trim();
  }));

  // Panier : il garde les compagnons choisis ; le paiement n'est pas ouvert (aucune carte demandée).
  const PRICE = 249;
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem('panier')) || {}; } catch {}
  const cartSave = () => { try { localStorage.setItem('panier', JSON.stringify(cart)); } catch {} };
  const cartCountAll = () => Object.values(cart).reduce((a, b) => a + b, 0);
  function cartDraw() {
    const n = cartCountAll(), ids = Object.keys(cart);
    $('#cartCount').textContent = n; $('#cartCount').hidden = !n;
    $('#cartList').innerHTML = ids.map((id) => {
      const b = $(`[data-fiche="${id}"]`);
      return `<li><img src="media/gz/p-${id}.webp" alt=""><div><b>${b.dataset.nom}</b><span>${b.dataset.role} · ${T('249 €')}</span></div><div class="qty"><button type="button" data-less="${id}" aria-label="−">−</button><span>${cart[id]}</span><button type="button" data-more="${id}" aria-label="+">+</button></div></li>`;
    }).join('');
    $('#cartEmpty').hidden = n > 0; $('#cartFull').hidden = !n;
    const total = n * PRICE;
    $('#cartTotal').textContent = document.documentElement.lang === 'en' ? '€' + total : total + ' €';
  }
  function cartAdd(id) { cart[id] = (cart[id] || 0) + 1; cartSave(); cartDraw(); }
  $('#cartOpen').addEventListener('click', () => { cartDraw(); $('#cart').showModal(); });
  $('#cartClose').addEventListener('click', () => $('#cart').close());
  $('#cart').addEventListener('click', (e) => {
    if (e.target === $('#cart')) return $('#cart').close();
    const b = e.target.closest('[data-less],[data-more]');
    if (!b) return;
    const id = b.dataset.less || b.dataset.more;
    cart[id] = (cart[id] || 0) + (b.dataset.more ? 1 : -1);
    if (cart[id] <= 0) delete cart[id];
    cartSave(); cartDraw();
  });
  $('#cartGo').addEventListener('click', () => {
    const first = Object.keys(cart)[0];
    if (first) $('#bookPick').value = $(`[data-fiche="${first}"]`).dataset.nom;
    $('#cart').close(); location.hash = '#reserver'; $('#bookName').focus({ preventScroll: true });
  });
  document.addEventListener('langue', cartDraw);
  cartDraw();

  // Visionneuse plein écran : un toucher zoome sur les détails, un autre revient à l'image entière.
  const box = $('#box');
  if (box && box.showModal) {
    const img = $('#boxImg'), tip = $('#boxTip');
    const zoomSet = (on, e) => {
      box.classList.toggle('big', on);
      tip.textContent = T(on ? 'Faites glisser pour explorer · touchez pour revenir' : 'Touchez l’image pour zoomer');
      if (on && e) { const r = img.getBoundingClientRect(); box.scrollLeft = (e.offsetX / e.target.clientWidth) * r.width - innerWidth / 2; box.scrollTop = (e.offsetY / e.target.clientHeight) * r.height - innerHeight / 2; }
    };
    $$('[data-zoom]').forEach((b) => b.addEventListener('click', () => { const i = $('img', b); img.src = i.src; img.alt = i.alt; zoomSet(false); box.showModal(); }));
    img.addEventListener('click', (e) => { const before = { offsetX: e.offsetX, offsetY: e.offsetY, target: { clientWidth: img.clientWidth, clientHeight: img.clientHeight } }; zoomSet(!box.classList.contains('big'), before); });
    $('#boxClose').addEventListener('click', () => box.close());
    box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
  }

  // Fiches des compagnons
  const fiche = $('#fiche');
  if (fiche && fiche.showModal) {
    $$('[data-fiche]').forEach((b) => b.addEventListener('click', () => {
      $('#ficheImg').src = 'media/gz/p-' + b.dataset.fiche + '.webp';
      $('#ficheImg').alt = b.dataset.nom;
      $('#ficheNom').textContent = b.dataset.nom;
      $('#ficheRole').textContent = b.dataset.role;
      $('#ficheTexte').textContent = b.dataset.texte;
      fiche.dataset.nom = b.dataset.nom;
      fiche.dataset.id = b.dataset.fiche;
      fiche.showModal();
    }));
    $('#ficheClose').addEventListener('click', () => fiche.close());
    fiche.addEventListener('click', (e) => { if (e.target === fiche) fiche.close(); });
    $('#ficheAdd').addEventListener('click', () => { cartAdd(fiche.dataset.id); fiche.close(); $('#cart').showModal(); });
  }

  // Réservation : le formulaire est prêt, l'enregistrement se branchera avec l'hébergement.
  const book = $('#bookForm');
  if (book) book.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = $('#bookMsg'), name = $('#bookName').value.trim(), mail = $('#bookMail').value.trim();
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) { msg.textContent = T('Indiquez votre prénom et une adresse e-mail valide.'); return; }
    msg.textContent = T('Merci') + ' ' + name + ' ! ' + T('Démonstration : les inscriptions seront enregistrées à l’ouverture officielle du site.');
  });

  // ---------- Effets ----------
  // Barre de progression et halo qui suit la souris
  const bar = $('#progress'), halo = $('#glow');
  const onScroll = () => { const max = document.documentElement.scrollHeight - innerHeight; bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')'; };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  // Entrée du titre au moment où l'écran d'entrée se ferme
  const enter = () => document.body.classList.add('entered');
  const g = $('#gate');
  if (!g || g.hidden) enter(); else ['#gateOn', '#gateOff'].forEach((id) => $(id).addEventListener('click', enter));
  // L'œil qui suit le regard : il vise la souris ou le doigt, cligne, et change de couleur au toucher
  const gaze = $('#gaze');
  if (gaze) {
    const IRIS = [['#1464e6', '#2aa7ff'], ['#b8650a', '#ffb347'], ['#0f8a4a', '#5fe08a'], ['#c0267a', '#ff7ac0'], ['#6a35d6', '#b48bff']];
    let tone = 0, lastMove = 0;
    const aim = (cx, cy) => {
      const r = gaze.getBoundingClientRect(), dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 320);
      gaze.style.setProperty('--x', ((dx / d) * k).toFixed(3)); gaze.style.setProperty('--y', ((dy / d) * k).toFixed(3));
      lastMove = performance.now();
    };
    addEventListener('pointermove', (e) => { aim(e.clientX, e.clientY); if (halo && e.pointerType === 'mouse') { halo.style.opacity = 1; halo.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)'; } }, { passive: true });
    addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) aim(t.clientX, t.clientY); }, { passive: true });
    gaze.addEventListener('click', () => { tone = (tone + 1) % IRIS.length; gaze.style.setProperty('--iris', IRIS[tone][0]); gaze.style.setProperty('--iris2', IRIS[tone][1]); blink(); });
    const blink = () => { gaze.classList.add('blink'); setTimeout(() => gaze.classList.remove('blink'), 150); };
    if (!calm) {
      setInterval(() => { if (Math.random() < .55) blink(); }, 2600);
      // Sans souris ni doigt, il regarde autour de lui
      const wander = (t) => { if (t - lastMove > 2500) { gaze.style.setProperty('--x', (Math.sin(t / 1300) * .7).toFixed(3)); gaze.style.setProperty('--y', (Math.cos(t / 1900) * .45).toFixed(3)); } requestAnimationFrame(wander); };
      requestAnimationFrame(wander);
    }
  }
  // Relief des cartes sous la souris
  if (!calm && matchMedia('(hover: hover)').matches) {
    $$('.names button, .pays, .facts div, .care article, .pillars li').forEach((el) => {
      el.classList.add('tilt');
      el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transform = 'perspective(700px) rotateX(' + (-y * 9).toFixed(2) + 'deg) rotateY(' + (x * 9).toFixed(2) + 'deg) translateY(-4px)'; });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  // ---------- La plongée dans l'œil ----------
  // Un œil géant dont la pupille est une fenêtre sur la vidéo. En défilant, la pupille grandit jusqu'à remplir l'écran.
  const dive = $('#dive'), dEye = $('#diveEye');
  if (dive && dEye && !calm) {
    const A = $('#diveA'), B = $('#diveB'), hint = $('#diveHint'), shine = $('#diveShine');
    let px = 0, py = 0, tx = 0, ty = 0, raf = 0, last = 0;
    const clamp = (v) => Math.max(0, Math.min(1, v));
    const draw = (now) => {
      raf = 0;
      const r = dive.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      const p = clamp(-r.top / (r.height - vh));
      // Sans souris, l'œil regarde doucement autour de lui
      if (now - last > 2200) { tx = Math.sin(now / 1500) * .6; ty = Math.cos(now / 2100) * .35; }
      px += (tx - px) * .12; py += (ty - py) * .12;
      const calmDown = 1 - clamp(p / .35);
      const R0 = Math.min(vw, vh) * .1, Rmax = Math.hypot(vw, vh) * .62;
      const e = clamp(p / .78), R = R0 * Math.pow(Rmax / R0, e * e * (3 - 2 * e));
      const cx = vw / 2 + px * R0 * 1.5 * calmDown, cy = vh / 2 + py * R0 * 1.1 * calmDown + (1 - clamp(p / .5)) * vh * .04;
      const f = (k) => (R * k).toFixed(1) + 'px';
      dEye.style.background =
        'radial-gradient(circle at ' + cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px,' +
        'rgba(3,6,15,0) 0,rgba(3,6,15,0) ' + f(.97) + ',#03060f ' + f(1) + ',#03060f ' + f(1.05) + ',#7fd2ff ' + f(1.16) + ',#2aa7ff ' + f(1.4) + ',#1464e6 ' + f(1.85) + ',#0b3fb0 ' + f(2.12) + ',#061a44 ' + f(2.24) + ',#f4f7fd ' + f(2.3) + ',#ffffff ' + f(2.9) + ',#eef3fc ' + f(3.7) + ',#cfdcf5 ' + f(4.15) + ',#dbe6fb ' + f(4.22) + ',#f3f7ff ' + f(4.6) + ',#ffffff ' + f(5.2) + ')';
      const sz = R * .5; shine.style.width = shine.style.height = sz.toFixed(1) + 'px'; shine.style.transform = 'translate(' + (cx + R * 1.2 - sz / 2).toFixed(1) + 'px,' + (cy - R * 1.3 - sz / 2).toFixed(1) + 'px)';
      shine.style.opacity = (1 - clamp((p - .3) / .25)).toFixed(2);
      A.style.opacity = (1 - clamp(p / .16)).toFixed(2); A.style.transform = 'translateY(' + (-p * 160).toFixed(0) + 'px)';
      hint.style.opacity = (1 - clamp(p / .08)).toFixed(2);
      const b = clamp((p - .74) / .16);
      B.style.opacity = b.toFixed(2); B.style.transform = 'translateY(-50%) scale(' + (.86 + b * .14).toFixed(3) + ')';
      if (p < .999) raf = requestAnimationFrame(draw);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };
    addEventListener('scroll', kick, { passive: true });
    addEventListener('resize', kick);
    addEventListener('pointermove', (e) => { tx = (e.clientX / innerWidth - .5) * 2; ty = (e.clientY / innerHeight - .5) * 2; last = performance.now(); kick(); }, { passive: true });
    kick();
  }
})();
