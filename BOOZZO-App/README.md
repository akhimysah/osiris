# BOOZZO — l'application de l'œil

Application web de la peluche BOOZZO. La peluche reste immobile : tout se passe dans son œil, un écran rond. Elle fonctionne dès maintenant dans un navigateur (téléphone ou ordinateur) et est prévue pour tourner telle quelle sur l'écran rond du futur prototype.

## Ce que fait l'application

- **Menu rond** dans l'œil : Appels, YouTube, Photo, Assistant, Histoires, Iris.
- **Appels vidéo dans l'œil** entre deux appareils : BOOZZO ouvre un appel, le proche scanne un QR code ou ouvre un lien sur son téléphone, sans rien installer. Chacun voit et entend l'autre (WebRTC).
- **Proches** : on ajoute un proche par son prénom ; il reçoit un lien permanent à garder ouvert sur son téléphone. « BOOZZO, appelle Mamie » fait sonner sa page ; il peut aussi appeler BOOZZO, qui sonne et affiche son prénom dans l'œil (« réponds » ou « refuse » à la voix).
- **Voix** : bouton micro, ou écoute continue du mot « BOOZZO ». Exemples : « BOOZZO, mets YouTube », « BOOZZO, appelle », « prends une photo », « mets l'iris en violet », « raccroche ».
- **Assistant** : toute phrase qui n'est pas une commande est envoyée à l'assistant, qui répond à voix haute, phrase par phrase, dans l'œil. « Histoires » lui demande une histoire douce.
- **YouTube et TikTok** : lecture dans l'œil à partir du lien d'une vidéo (ou d'une playlist YouTube) ; les favoris nommés se lancent à la voix. Le fil d'accueil de ces services ne peut pas être intégré dans une page web.
- **Photo** : retour caméra dans l'œil, prise de vue, dernières photos gardées sur l'appareil.
- **Iris** : quatre couleurs, azur par défaut.
- **Téléphone** : sur la peluche, l'écran d'un téléphone peut être recopié dans l'œil pour y utiliser ses propres applications. Voir `peluche/README.md` (kit d'installation de la carte, pas encore essayé sur du matériel).
- **WhatsApp, Spotify** : ces tuiles ouvrent l'application officielle. BOOZZO ne les intègre pas : sur un appareil Android, le lien lance l'application installée ; ailleurs, il ouvre son site. Un proche peut avoir un numéro WhatsApp, gardé sur l'appareil.

## Démarrer

Node.js 22.13 ou ultérieur.

```sh
npm install
node dev.mjs
```

Ouvrir http://127.0.0.1:4174.

- `/?oeil` affiche l'œil seul, en plein écran : c'est la vue destinée à l'écran rond du prototype.
- `/?appel=<identifiant>` est la page d'un proche invité à un appel ponctuel.
- `/?proche=<identifiant>` est la page permanente d'un proche.

### Brancher l'assistant

L'assistant utilise l'API Claude. Sans clé, tout le reste fonctionne et l'assistant indique qu'il n'est pas branché.

```sh
ANTHROPIC_API_KEY=... node dev.mjs
```

La clé reste sur le serveur ; elle n'est jamais envoyée au navigateur. Chaque réponse est facturée à l'usage sur le compte de la clé.

## Mettre en ligne (HTTPS)

Caméra, micro et appels exigent HTTPS. Le plus simple est Render, qui lit le fichier `render.yaml` à la racine du dépôt :

1. Ouvrir https://render.com/deploy?repo=https://github.com/akhimysah/osiris/tree/claude/boozzo-prototype-lab-xghudf et se connecter avec GitHub.
2. Quand Render demande `ANTHROPIC_API_KEY`, coller une clé créée sur https://console.anthropic.com (facultatif : sans clé, seul l'assistant est inactif).
3. Valider. Render donne une adresse `https://….onrender.com` : c'est l'application.

Sur l'offre gratuite, le service s'endort après 15 minutes sans visite (premier chargement lent) et les proches enregistrés sont effacés à chaque redémarrage. Pour les garder, passer à une offre payante avec un disque et définir `DATA_DIR` sur ce disque.

Autre hébergeur : le `Dockerfile` fourni lance la même application (port 8080, données dans `/data`).

Variables d'environnement :

| Variable | Rôle |
|---|---|
| `ANTHROPIC_API_KEY` | active l'assistant |
| `HOST`, `PORT` | adresse d'écoute (`0.0.0.0` en ligne) |
| `DATA_DIR` | dossier de la base SQLite (`.local` par défaut) |
| `TURN_URLS`, `TURN_USERNAME`, `TURN_CREDENTIAL` | relais pour les appels sur réseaux mobiles |

## Organisation

- `ui/index.html`, `ui/style.css`, `ui/app.js` : l'interface (peluche, œil, panneau de commandes).
- `server.mjs` : routes HTTP au format « worker » (`fetch(req, env)`), stockage via `env.BUCKET`.
- `assistant.mjs` : appel à l'API Claude (SDK officiel) et personnalité de BOOZZO.
- `dev.mjs` : serveur local, stockage SQLite dans `.local/`.
- `peluche/` : kit d'installation de la carte de la peluche (œil au démarrage, recopie d'écran du téléphone).
- `docs/briques-open-source.md` : briques open source recensées et choix techniques.
- `build.mjs` : assemble `ui/` et `server.mjs` dans `dist/server/index.js`.

## Limites connues

- Caméra, micro et appels exigent HTTPS dès qu'on quitte `127.0.0.1`. Pour un appel entre deux vrais téléphones, l'application doit être hébergée en HTTPS.
- Les appels utilisent un serveur STUN public. Sur certains réseaux (4G, Wi-Fi d'entreprise), il faudra ajouter un relais TURN.
- La reconnaissance vocale dépend du navigateur (Chrome, Safari). L'écoute continue du mot « BOOZZO » est expérimentale.
- WhatsApp, Spotify et TikTok s'ouvrent dans leur application officielle, pas dans l'œil de l'aperçu web. Ils n'apparaîtront dans l'œil que sur un prototype dont l'écran rond est l'écran d'un appareil Android.
- Un proche ne reçoit un appel que si sa page est ouverte : il n'y a pas encore de notification sur téléphone verrouillé.
- Les proches et les favoris sont enregistrés dans le navigateur de l'appareil BOOZZO : ils ne se retrouvent pas encore d'un appareil à l'autre.
- Pas de reconnaissance faciale ni de comptes utilisateurs pour l'instant.
