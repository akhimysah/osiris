(() => {
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

  // Vidéos : toujours muettes, en pause hors écran
  $$('video').forEach((v) => {
    v.muted = true; v.defaultMuted = true; v.volume = 0;
    if (calm) { v.removeAttribute('autoplay'); v.pause(); return; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { if (!v.dataset.stopped) v.play().catch(() => {}); } else v.pause();
      }, { threshold: .2 }).observe(v);
    }
  });
  const filmBtn = $('#filmToggle'), film = $('#filmVideo');
  if (filmBtn && film) {
    const paint = () => { filmBtn.textContent = film.paused ? 'Lire' : 'Pause'; };
    filmBtn.addEventListener('click', () => {
      if (film.paused) { delete film.dataset.stopped; film.play().catch(() => {}); }
      else { film.dataset.stopped = '1'; film.pause(); }
    });
    film.addEventListener('play', paint); film.addEventListener('pause', paint); paint();
  }

  // L'œil : un mode à la fois
  const HALO = { iris: '#2e8bff', call: '#5c7cff', story: '#8a6bff', talk: '#2e8bff', video: '#ff7a59', meteo: '#6fc3ff', clock: '#ff5a4a', night: '#ffb347' };
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
})();
