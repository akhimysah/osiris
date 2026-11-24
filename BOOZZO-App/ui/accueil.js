// Page d'accueil (présentation) : affichée quand on arrive sans lien d'appel. Elle explique le fonctionnement,
// propose l'inscription et mène à l'application (même adresse avec ?app=1). Les liens d'appel l'ignorent.
(() => {
  const land = document.getElementById('landing');
  if (!land || !document.body.classList.contains('landing')) return;
  const lang = typeof DEMO_LANG === 'string' ? DEMO_LANG : 'fr';
  const T = {
    en: {
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
      'Inscrivez-vous pour être prévenu de l’ouverture et recevoir vos accès.': 'Sign up to be told when we open and to receive your access.',
      'Prénom': 'First name', 'Adresse e-mail': 'Email address', 'Je m’inscris': 'Sign me up',
      'Aucun paiement. Désinscription à tout moment.': 'No payment. Unsubscribe at any time.',
      'L’application BeyaBear’s': 'The BeyaBear’s app', 'BeyaBear’s, <em>à portée de main</em>': 'BeyaBear’s, <em>at your fingertips</em>',
      'L’application fonctionne dès maintenant dans votre navigateur, sans téléchargement. Les versions iPhone et Android arrivent.': 'The app works right now in your browser, with no download. iPhone and Android versions are coming.',
      'Bientôt sur iPhone': 'Coming soon to iPhone', 'Bientôt sur Android': 'Coming soon to Android',
      'Indiquez votre prénom et une adresse e-mail valide.': 'Enter your first name and a valid email address.',
      'Merci': 'Thank you', 'Votre inscription est notée sur cet appareil. Démonstration : elle sera envoyée à l’ouverture du service.': 'Your sign-up is saved on this device. Demo: it will be sent when the service opens.',
      'Démonstration · © 2026': 'Demo · © 2026',
    },
    es: {
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
      'Inscrivez-vous pour être prévenu de l’ouverture et recevoir vos accès.': 'Regístrate para enterarte de la apertura y recibir tus accesos.',
      'Prénom': 'Nombre', 'Adresse e-mail': 'Correo electrónico', 'Je m’inscris': 'Me registro',
      'Aucun paiement. Désinscription à tout moment.': 'Sin pago. Baja en cualquier momento.',
      'L’application BeyaBear’s': 'La aplicación BeyaBear’s', 'BeyaBear’s, <em>à portée de main</em>': 'BeyaBear’s, <em>al alcance de la mano</em>',
      'L’application fonctionne dès maintenant dans votre navigateur, sans téléchargement. Les versions iPhone et Android arrivent.': 'La aplicación ya funciona en tu navegador, sin descargar nada. Las versiones para iPhone y Android están en camino.',
      'Bientôt sur iPhone': 'Pronto en iPhone', 'Bientôt sur Android': 'Pronto en Android',
      'Indiquez votre prénom et une adresse e-mail valide.': 'Indica tu nombre y un correo electrónico válido.',
      'Merci': 'Gracias', 'Votre inscription est notée sur cet appareil. Démonstration : elle sera envoyée à l’ouverture du service.': 'Tu registro queda guardado en este dispositivo. Demostración: se enviará cuando abra el servicio.',
      'Démonstration · © 2026': 'Demostración · © 2026',
    },
  };
  const tr = (s) => (T[lang] && T[lang][s]) || s;
  land.querySelectorAll('[data-t]').forEach((e) => { e.innerHTML = tr(e.innerHTML.trim()); });
  land.querySelectorAll('[data-app]').forEach((a) => { a.href = './?app=1' + (lang !== 'fr' ? '&lang=' + lang : ''); });
  const form = document.getElementById('signForm'), msg = document.getElementById('signMsg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    const name = form.prenom.value.trim(), mail = form.email.value.trim();
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) { msg.textContent = tr('Indiquez votre prénom et une adresse e-mail valide.'); return; }
    try { localStorage.setItem('boozzo.inscription', JSON.stringify({ name, mail })); } catch {}
    msg.textContent = tr('Merci') + ' ' + name + ' ! ' + tr('Votre inscription est notée sur cet appareil. Démonstration : elle sera envoyée à l’ouverture du service.');
  }, true);
})();
