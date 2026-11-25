// Page d'accueil (présentation) : affichée quand on arrive sans lien d'appel. Elle explique le fonctionnement,
// propose l'inscription et mène à l'application (même adresse avec ?app=1). Les liens d'appel l'ignorent.
(() => {
  const land = document.getElementById('landing');
  if (!land || !document.body.classList.contains('landing')) return;
  const lang = typeof DEMO_LANG === 'string' ? DEMO_LANG : 'fr';
  const T = {
    en: {
      "« Pourquoi le ciel est bleu ? »": "“Why is the sky blue?”",
      "Je t’écoute": "I’m listening",
      "Dans l’œil": "In the eye",
      "Questions": "Questions",
      "Rien à installer pour les proches": "Nothing to install for loved ones",
      "Contacts choisis par les parents": "Contacts chosen by parents",
      "Fonctionne dans le navigateur": "Works in the browser",
      "Mamie appelle": "Grandma is calling",
      "Appel vidéo": "Video call",
      "Histoire du soir": "Bedtime story",
      "Le bateau de la lune": "The moon boat",
      "Course au miel": "Honey run",
      "12 pots attrapés": "12 pots caught",
      "Mamie": "Grandma",
      "Appel en cours": "Call in progress",
      "Tout se passe <em>dans son regard</em>": "It all happens <em>in its eyes</em>",
      "La peluche ne bouge pas. C’est son œil qui change, selon ce que l’enfant demande.": "The plush does not move. Its eye changes, depending on what the child asks for.",
      "Appels vidéo": "Video calls",
      "Le visage de vos proches, en grand, dans l’œil.": "Your loved ones’ faces, large, in the eye.",
      "Histoires du soir": "Bedtime stories",
      "Une voix douce raconte, l’œil s’habille de nuit.": "A gentle voice tells the story while the eye turns to night.",
      "Jeux": "Games",
      "Cinq jeux au doigt, dont la Course au miel.": "Five touch games, including Honey run.",
      "Assistant vocal": "Voice assistant",
      "L’enfant pose sa question, la peluche répond simplement.": "The child asks, the plush answers simply.",
      "Vidéos": "Videos",
      "Dessins animés et clips, directement dans l’œil.": "Cartoons and clips, right in the eye.",
      "Veilleuse": "Night light",
      "Une lumière chaude jusqu’au sommeil.": "A warm light until sleep comes.",
      "Pour les parents": "For parents",
      "Vous gardez <em>la main</em>": "You stay <em>in control</em>",
      "Un écran pour enfant doit d’abord rassurer les adultes.": "A screen for children must first reassure adults.",
      "La peluche n’appelle que les proches que vous avez approuvés.": "The plush only calls the people you have approved.",
      "Vous fixez les horaires et la durée d’écran.": "You set the hours and screen time.",
      "Les contenus sont adaptés à l’âge de l’enfant.": "Content is suited to the child’s age.",
      "Les visages reconnus restent dans la peluche.": "Recognised faces stay inside the plush.",
      "Proches autorisés": "Approved contacts",
      "Papa": "Dad",
      "Tonton Sam": "Uncle Sam",
      "Autorisé": "Approved",
      "Écran autorisé de 8 h à 19 h 30": "Screen allowed from 8 am to 7:30 pm",
      "Gratuit et sans engagement": "Free, no commitment",
      "Deux champs, trente secondes": "Two fields, thirty seconds",
      "Parler à BeyaBear’s": "Talk to BeyaBear’s",
      "Questions fréquentes": "Frequently asked questions",
      "On vous <em>répond</em>": "Your questions, <em>answered</em>",
      "Faut-il installer quelque chose ?": "Do I need to install anything?",
      "Non. L’application s’ouvre dans le navigateur, et vos proches rejoignent l’appel depuis un simple lien.": "No. The app opens in the browser, and your loved ones join the call from a simple link.",
      "Qui peut appeler la peluche ?": "Who can call the plush?",
      "Uniquement les proches que le parent a ajoutés. Personne d’autre ne peut joindre l’enfant.": "Only the people the parent has added. Nobody else can reach the child.",
      "Combien ça coûte ?": "How much does it cost?",
      "L’inscription est gratuite. Le prix de la peluche et des options sera annoncé aux inscrits avant l’ouverture.": "Signing up is free. The price of the plush and options will be announced to those signed up before launch.",
      "Faut-il déjà avoir la peluche ?": "Do I need the plush already?",
      "Non. Vous pouvez découvrir toute l’application dès maintenant sur votre téléphone ou votre ordinateur.": "No. You can explore the whole app right now on your phone or computer.",
      "Prêt à voir son regard s’allumer ?": "Ready to see its eyes light up?",
      "Créez votre compte ou ouvrez l’application tout de suite.": "Create your account or open the app right away.",
      "La peluche dont l’œil est un écran.": "The plush whose eye is a screen.",
      "Découvrir": "Discover",
      "Commencer": "Get started",
      'Comment ça marche': 'How it works', 'Inscription': 'Sign up', 'L’application': 'The app', 'Ouvrir l’application': 'Open the app',
      'La peluche dont l’œil est un écran': 'The plush whose eye is a screen',
      'Appelez vos proches <em>d’un simple regard</em>': 'Call your loved ones <em>with a single look</em>',
      'BeyaBear’s met vos proches, les histoires et les jeux dans l’œil d’une peluche. Simple pour l’enfant, rassurant pour les parents.': 'BeyaBear’s puts your loved ones, stories and games in the eye of a plush. Simple for the child, reassuring for parents.',
      'Créer mon compte': 'Create my account', 'Un parcours <em>simple et rassurant</em>': 'A <em>simple, reassuring</em> journey',
      'De l’inscription au premier appel, tout se fait en quelques minutes.': 'From sign-up to the first call, it all takes a few minutes.',
      'Création du compte': 'Create the account', 'Un parent s’inscrit avec son prénom et son e-mail.': 'A parent signs up with a first name and email.',
      'Ajout des proches': 'Add loved ones', 'Mamie, papa, tonton : vous choisissez qui peut appeler.': 'Grandma, dad, uncle: you choose who can call.',
      'Envoi du lien': 'Send the link', 'Chaque proche reçoit un lien, sans rien installer.': 'Each loved one gets a link, with nothing to install.',
      'L’appel dans l’œil': 'The call in the eye', 'Le visage du proche apparaît dans l’œil de la peluche.': 'Their face appears in the plush’s eye.',
      'Histoires et jeux': 'Stories and games', 'Histoires du soir, jeux, assistant vocal et veilleuse.': 'Bedtime stories, games, voice assistant and night light.',
      'Parents aux commandes': 'Parents in control', 'Contacts, horaires et contenus se règlent depuis votre téléphone.': 'Contacts, hours and content are set from your phone.',
      'Inscription gratuite': 'Free sign-up', 'Créez votre <em>compte parent</em>': 'Create your <em>parent account</em>',
      'Créez votre compte ici : il ouvre directement votre application BeyaBear’s.': 'Create your account here: it opens your BeyaBear’s application right away.', 'Inscrivez-vous pour être prévenu de l’ouverture et recevoir vos accès.': 'Sign up to be told when we open and to receive your access.',
      'Prénom': 'First name', 'Adresse e-mail': 'Email address', 'Je m’inscris': 'Sign me up',
      'Aucun paiement. Désinscription à tout moment.': 'No payment. Unsubscribe at any time.',
      'L’application BeyaBear’s': 'The BeyaBear’s app', 'BeyaBear’s, <em>à portée de main</em>': 'BeyaBear’s, <em>at your fingertips</em>',
      'L’application fonctionne dès maintenant dans votre navigateur, sans téléchargement. Les versions iPhone et Android arrivent.': 'The app works right now in your browser, with no download. iPhone and Android versions are coming.',
      'Bientôt sur iPhone': 'Coming soon to iPhone', 'Essayez tout de suite': "Try it right now", "Astuce : ajoutez BeyaBear’s à l’écran d’accueil de votre téléphone. Sur iPhone, touchez Partager puis « Sur l’écran d’accueil ». Sur Android, ouvrez le menu puis « Ajouter à l’écran d’accueil ». Elle s’ouvre alors en plein écran, comme une application.": "Tip: add BeyaBear’s to your phone’s home screen. On iPhone, tap Share then “Add to Home Screen”. On Android, open the menu then “Add to Home screen”. It then opens full screen, like an app.", 'Bientôt sur Android': 'Coming soon to Android',
      'Indiquez votre prénom et une adresse e-mail valide.': 'Enter your first name and a valid email address.',
      'Merci': 'Thank you', 'Votre compte est prêt sur cet appareil.': 'Your account is ready on this device.', 'Ouvrir mon application': 'Open my application', 'Votre inscription est notée sur cet appareil. Démonstration : elle sera envoyée à l’ouverture du service.': 'Your sign-up is saved on this device. Demo: it will be sent when the service opens.',
      'Démonstration · © 2026': 'Demo · © 2026',
    },
    es: {
      "« Pourquoi le ciel est bleu ? »": "«¿Por qué el cielo es azul?»",
      "Je t’écoute": "Te escucho",
      "Dans l’œil": "En el ojo",
      "Questions": "Preguntas",
      "Rien à installer pour les proches": "Nada que instalar para los tuyos",
      "Contacts choisis par les parents": "Contactos elegidos por los padres",
      "Fonctionne dans le navigateur": "Funciona en el navegador",
      "Mamie appelle": "La abuela llama",
      "Appel vidéo": "Videollamada",
      "Histoire du soir": "Cuento para dormir",
      "Le bateau de la lune": "El barco de la luna",
      "Course au miel": "Carrera de miel",
      "12 pots attrapés": "12 tarros atrapados",
      "Mamie": "Abuela",
      "Appel en cours": "Llamada en curso",
      "Tout se passe <em>dans son regard</em>": "Todo ocurre <em>en su mirada</em>",
      "La peluche ne bouge pas. C’est son œil qui change, selon ce que l’enfant demande.": "El peluche no se mueve. Es su ojo el que cambia, según lo que pide el niño.",
      "Appels vidéo": "Videollamadas",
      "Le visage de vos proches, en grand, dans l’œil.": "La cara de los tuyos, en grande, en el ojo.",
      "Histoires du soir": "Cuentos para dormir",
      "Une voix douce raconte, l’œil s’habille de nuit.": "Una voz suave cuenta el cuento y el ojo se viste de noche.",
      "Jeux": "Juegos",
      "Cinq jeux au doigt, dont la Course au miel.": "Cinco juegos táctiles, entre ellos Carrera de miel.",
      "Assistant vocal": "Asistente de voz",
      "L’enfant pose sa question, la peluche répond simplement.": "El niño pregunta y el peluche responde con sencillez.",
      "Vidéos": "Vídeos",
      "Dessins animés et clips, directement dans l’œil.": "Dibujos animados y clips, directamente en el ojo.",
      "Veilleuse": "Luz de noche",
      "Une lumière chaude jusqu’au sommeil.": "Una luz cálida hasta dormirse.",
      "Pour les parents": "Para los padres",
      "Vous gardez <em>la main</em>": "Tú tienes <em>el control</em>",
      "Un écran pour enfant doit d’abord rassurer les adultes.": "Una pantalla para niños debe ante todo tranquilizar a los adultos.",
      "La peluche n’appelle que les proches que vous avez approuvés.": "El peluche solo llama a las personas que has aprobado.",
      "Vous fixez les horaires et la durée d’écran.": "Tú fijas los horarios y el tiempo de pantalla.",
      "Les contenus sont adaptés à l’âge de l’enfant.": "Los contenidos se adaptan a la edad del niño.",
      "Les visages reconnus restent dans la peluche.": "Las caras reconocidas se quedan en el peluche.",
      "Proches autorisés": "Contactos autorizados",
      "Papa": "Papá",
      "Tonton Sam": "Tío Sam",
      "Autorisé": "Autorizado",
      "Écran autorisé de 8 h à 19 h 30": "Pantalla permitida de 8:00 a 19:30",
      "Gratuit et sans engagement": "Gratis y sin compromiso",
      "Deux champs, trente secondes": "Dos campos, treinta segundos",
      "Parler à BeyaBear’s": "Hablar con BeyaBear’s",
      "Questions fréquentes": "Preguntas frecuentes",
      "On vous <em>répond</em>": "Te <em>respondemos</em>",
      "Faut-il installer quelque chose ?": "¿Hay que instalar algo?",
      "Non. L’application s’ouvre dans le navigateur, et vos proches rejoignent l’appel depuis un simple lien.": "No. La aplicación se abre en el navegador, y los tuyos se unen a la llamada con un simple enlace.",
      "Qui peut appeler la peluche ?": "¿Quién puede llamar al peluche?",
      "Uniquement les proches que le parent a ajoutés. Personne d’autre ne peut joindre l’enfant.": "Solo las personas que el padre ha añadido. Nadie más puede contactar con el niño.",
      "Combien ça coûte ?": "¿Cuánto cuesta?",
      "L’inscription est gratuite. Le prix de la peluche et des options sera annoncé aux inscrits avant l’ouverture.": "El registro es gratuito. El precio del peluche y de las opciones se anunciará a los inscritos antes de la apertura.",
      "Faut-il déjà avoir la peluche ?": "¿Hace falta tener ya el peluche?",
      "Non. Vous pouvez découvrir toute l’application dès maintenant sur votre téléphone ou votre ordinateur.": "No. Puedes descubrir toda la aplicación ahora mismo en tu teléfono u ordenador.",
      "Prêt à voir son regard s’allumer ?": "¿Listo para ver cómo se enciende su mirada?",
      "Créez votre compte ou ouvrez l’application tout de suite.": "Crea tu cuenta o abre la aplicación ahora mismo.",
      "La peluche dont l’œil est un écran.": "El peluche cuyo ojo es una pantalla.",
      "Découvrir": "Descubrir",
      "Commencer": "Empezar",
      'Comment ça marche': 'Cómo funciona', 'Inscription': 'Registro', 'L’application': 'La aplicación', 'Ouvrir l’application': 'Abrir la aplicación',
      'La peluche dont l’œil est un écran': 'El peluche cuyo ojo es una pantalla',
      'Appelez vos proches <em>d’un simple regard</em>': 'Llama a los tuyos <em>con una simple mirada</em>',
      'BeyaBear’s met vos proches, les histoires et les jeux dans l’œil d’une peluche. Simple pour l’enfant, rassurant pour les parents.': 'BeyaBear’s pone a tus seres queridos, los cuentos y los juegos en el ojo de un peluche. Sencillo para el niño, tranquilizador para los padres.',
      'Créer mon compte': 'Crear mi cuenta', 'Un parcours <em>simple et rassurant</em>': 'Un recorrido <em>sencillo y tranquilizador</em>',
      'De l’inscription au premier appel, tout se fait en quelques minutes.': 'Del registro a la primera llamada, todo se hace en unos minutos.',
      'Création du compte': 'Creación de la cuenta', 'Un parent s’inscrit avec son prénom et son e-mail.': 'Un padre se registra con su nombre y su correo.',
      'Ajout des proches': 'Añadir a los tuyos', 'Mamie, papa, tonton : vous choisissez qui peut appeler.': 'La abuela, papá, el tío: tú eliges quién puede llamar.',
      'Envoi du lien': 'Envío del enlace', 'Chaque proche reçoit un lien, sans rien installer.': 'Cada persona recibe un enlace, sin instalar nada.',
      'L’appel dans l’œil': 'La llamada en el ojo', 'Le visage du proche apparaît dans l’œil de la peluche.': 'Su cara aparece en el ojo del peluche.',
      'Histoires et jeux': 'Cuentos y juegos', 'Histoires du soir, jeux, assistant vocal et veilleuse.': 'Cuentos para dormir, juegos, asistente de voz y luz de noche.',
      'Parents aux commandes': 'Los padres al mando', 'Contacts, horaires et contenus se règlent depuis votre téléphone.': 'Contactos, horarios y contenidos se ajustan desde tu teléfono.',
      'Inscription gratuite': 'Registro gratuito', 'Créez votre <em>compte parent</em>': 'Crea tu <em>cuenta de padre</em>',
      'Créez votre compte ici : il ouvre directement votre application BeyaBear’s.': 'Crea tu cuenta aquí: abre directamente tu aplicación BeyaBear’s.', 'Inscrivez-vous pour être prévenu de l’ouverture et recevoir vos accès.': 'Regístrate para enterarte de la apertura y recibir tus accesos.',
      'Prénom': 'Nombre', 'Adresse e-mail': 'Correo electrónico', 'Je m’inscris': 'Me registro',
      'Aucun paiement. Désinscription à tout moment.': 'Sin pago. Baja en cualquier momento.',
      'L’application BeyaBear’s': 'La aplicación BeyaBear’s', 'BeyaBear’s, <em>à portée de main</em>': 'BeyaBear’s, <em>al alcance de la mano</em>',
      'L’application fonctionne dès maintenant dans votre navigateur, sans téléchargement. Les versions iPhone et Android arrivent.': 'La aplicación ya funciona en tu navegador, sin descargar nada. Las versiones para iPhone y Android están en camino.',
      'Bientôt sur iPhone': 'Pronto en iPhone', 'Essayez tout de suite': "Pruébalo ahora mismo", "Astuce : ajoutez BeyaBear’s à l’écran d’accueil de votre téléphone. Sur iPhone, touchez Partager puis « Sur l’écran d’accueil ». Sur Android, ouvrez le menu puis « Ajouter à l’écran d’accueil ». Elle s’ouvre alors en plein écran, comme une application.": "Consejo: añade BeyaBear’s a la pantalla de inicio de tu teléfono. En iPhone, toca Compartir y luego «Añadir a pantalla de inicio». En Android, abre el menú y luego «Añadir a pantalla de inicio». Así se abre a pantalla completa, como una aplicación.", 'Bientôt sur Android': 'Pronto en Android',
      'Indiquez votre prénom et une adresse e-mail valide.': 'Indica tu nombre y un correo electrónico válido.',
      'Merci': 'Gracias', 'Votre compte est prêt sur cet appareil.': 'Tu cuenta está lista en este dispositivo.', 'Ouvrir mon application': 'Abrir mi aplicación', 'Votre inscription est notée sur cet appareil. Démonstration : elle sera envoyée à l’ouverture du service.': 'Tu registro queda guardado en este dispositivo. Demostración: se enviará cuando abra el servicio.',
      'Démonstration · © 2026': 'Demostración · © 2026',
    },
  };
  const tr = (s) => (T[lang] && T[lang][s]) || s;
  land.querySelectorAll('[data-t]').forEach((e) => { e.innerHTML = tr(e.innerHTML.trim()); });
  land.querySelectorAll('[data-app]').forEach((a) => { a.href = './?app=1' + (lang !== 'fr' ? '&lang=' + lang : ''); });
  // Les applications les plus parlantes, à ouvrir d'un toucher depuis la page d'accueil.
  const box = land.querySelector('#lApps');
  if (box && typeof APPS !== 'undefined') {
    const pick = ['emo', 'youtube', 'call', 'games', 'story', 'core', 'chat', 'dream'];
    box.innerHTML = pick.map((id) => APPS.find((x) => x[0] === id)).filter(Boolean)
      .map(([id, label, color]) => `<a href="./?app=1&go=${id}${lang !== 'fr' ? '&lang=' + lang : ''}"><i class="${color}">${ICON[id]}</i>${label}</a>`).join('')
      + EXTERNAL.map((app) => externalTile(app)).join('');
  }
  land.querySelectorAll('[data-l]').forEach((a) => a.classList.toggle('on', a.dataset.l === lang));
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    land.classList.add('js-up');
    const io = new IntersectionObserver((list) => list.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
    land.querySelectorAll('.up').forEach((e) => io.observe(e));
    setTimeout(() => land.querySelectorAll('.up').forEach((e) => e.classList.add('in')), 2500);
  }
  const form = document.getElementById('signForm'), msg = document.getElementById('signMsg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    const name = form.prenom.value.trim(), mail = form.email.value.trim();
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) { msg.textContent = tr('Indiquez votre prénom et une adresse e-mail valide.'); return; }
    try { localStorage.setItem('boozzo.inscription', JSON.stringify({ name, mail })); } catch {}
    // Le même compte sert dans l'application : inutile de le recréer dans le Beya Store.
    try { localStorage.setItem('boozzo.account', JSON.stringify({ email: mail, child: '', parent: name })); localStorage.setItem('boozzo.email', JSON.stringify(mail)); } catch {}
    msg.textContent = tr('Merci') + ' ' + name + ' ! ' + tr('Votre compte est prêt sur cet appareil.') + ' ';
    const open = document.createElement('a');
    open.className = 'btn go big'; open.href = './?app=1' + (lang !== 'fr' ? '&lang=' + lang : ''); open.textContent = tr('Ouvrir mon application'); open.style.marginTop = '12px'; open.style.display = 'inline-flex';
    msg.append(document.createElement('br'), open);
  }, true);

  // ---------- L'œil vivant : l'écran de l'ourson et le grand œil changent de fonction ----------
  const VIEWS = [
    ['iris', ''],
    ['call', '<div class="face">M</div><b>' + tr('Mamie') + '</b><small>' + tr('Appel en cours') + '</small><div class="keys"><u></u><u class="end"></u><u></u></div>'],
    ['story', '<div class="moon"></div><b>' + tr('Le bateau de la lune') + '</b><small>' + tr('Histoire du soir') + '</small>'],
    ['game', '<div class="pots"><u></u><u></u><u></u></div><b>12</b><small>' + tr('Course au miel') + '</small>'],
    ['talk', '<div class="wave"><u></u><u></u><u></u><u></u><u></u><u></u><u></u></div><b>' + tr('« Pourquoi le ciel est bleu ? »') + '</b><small>' + tr('Je t’écoute') + '</small>'],
    ['video', '<div class="play"></div>'],
    ['night', ''],
  ];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const build = (el) => { el.innerHTML = VIEWS.map(([k, html]) => '<div class="v v-' + k + '">' + html + '</div>').join(''); return [...el.children]; };
  const show = (list, n) => list.forEach((v, i) => v.classList.toggle('on', i === n));
  const hero = document.getElementById('lLive'), big = document.getElementById('lEye');
  if (hero) { const vs = build(hero); let n = 0; show(vs, 0); if (!calm) setInterval(() => { n = (n + 1) % vs.length; show(vs, n); }, 2400); }
  if (big) {
    const vs = build(big), feats = [...land.querySelectorAll('.l-feats li')], MAP = [1, 2, 3, 4, 5, 6];
    let n = 0, auto = null;
    const pick = (i) => { n = i; show(vs, MAP[i]); feats.forEach((f, k) => f.classList.toggle('on', k === i)); };
    feats.forEach((f, i) => { f.tabIndex = 0; const go = () => { clearInterval(auto); pick(i); }; f.addEventListener('click', go); f.addEventListener('pointerenter', (e) => e.pointerType === 'mouse' && go()); f.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && go()); });
    pick(0);
    if (!calm) auto = setInterval(() => pick((n + 1) % feats.length), 2800);
  }
  // L'iris suit la souris ou le doigt ; l'ourson et les cartes réagissent au pointeur
  const bear = land.querySelector('.l-bear'), bar = document.getElementById('lProgress');
  const look = (x, y) => { const ix = (x / innerWidth - .5) * 2, iy = (y / innerHeight - .5) * 2; land.style.setProperty('--ix', ix.toFixed(3)); land.style.setProperty('--iy', iy.toFixed(3)); if (bear && !calm && matchMedia('(hover: hover)').matches) bear.style.transform = 'perspective(900px) rotateY(' + (ix * 6).toFixed(2) + 'deg) rotateX(' + (-iy * 6).toFixed(2) + 'deg)'; };
  addEventListener('pointermove', (e) => look(e.clientX, e.clientY), { passive: true });
  addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) look(t.clientX, t.clientY); }, { passive: true });
  addEventListener('scroll', () => { const max = document.documentElement.scrollHeight - innerHeight; if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')'; }, { passive: true });
  if (!calm && matchMedia('(hover: hover)').matches) land.querySelectorAll('.l-steps li, .l-card, .l-form').forEach((el) => {
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transform = 'perspective(800px) rotateX(' + (-y * 7).toFixed(2) + 'deg) rotateY(' + (x * 7).toFixed(2) + 'deg) translateY(-5px)'; });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
})();
