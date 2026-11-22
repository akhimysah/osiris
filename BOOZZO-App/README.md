# BOOZZO — l'application de l'œil

Application web de la peluche BOOZZO. La peluche reste immobile : tout se passe dans son œil, un écran rond. Elle fonctionne dès maintenant dans un navigateur (téléphone ou ordinateur) et est prévue pour tourner telle quelle sur l'écran rond du futur prototype.

## Ce que fait l'application

- **Menu rond** dans l'œil : Appels, YouTube, Photo, Assistant, Histoires, Iris.
- **Appels vidéo dans l'œil** entre deux appareils : BOOZZO ouvre un appel, le proche scanne un QR code ou ouvre un lien sur son téléphone, sans rien installer. Chacun voit et entend l'autre (WebRTC).
- **Appel par lien WhatsApp** : BOOZZO ouvre un appel et prépare un message WhatsApp contenant un lien. Le proche touche le lien, l'appel démarre tout seul et son visage apparaît dans l'œil. L'appel lui-même est celui de BOOZZO (WebRTC), pas un appel WhatsApp : WhatsApp sert à envoyer le lien.
- **Proches** : on ajoute un proche par son prénom ; il reçoit un lien permanent à garder ouvert sur son téléphone. « BOOZZO, appelle Mamie » fait sonner sa page ; il peut aussi appeler BOOZZO, qui sonne et affiche son prénom dans l'œil (« réponds » ou « refuse » à la voix).
- **Voix** : bouton micro, ou écoute continue du mot « BOOZZO ». Exemples : « BOOZZO, mets YouTube », « BOOZZO, appelle », « prends une photo », « mets l'iris en violet », « raccroche ».
- **Assistant** : toute phrase qui n'est pas une commande est envoyée à l'assistant, qui répond à voix haute, phrase par phrase, dans l'œil. « Histoires » lui demande une histoire douce.
- **Sans assistant branché** : BOOZZO répond avec quelques réponses et trois histoires intégrées (`builtInReply` dans `ui/app.js`), lues à voix haute. Ce n'est pas une intelligence artificielle ; l'écran l'indique.
- **YouTube et TikTok** : lecture dans l'œil à partir du lien d'une vidéo (ou d'une playlist YouTube) ; les favoris nommés se lancent à la voix. Le fil d'accueil de ces services ne peut pas être intégré dans une page web.
- **Photo** : retour caméra dans l'œil, prise de vue, dernières photos gardées sur l'appareil.
- **Iris** : quatre couleurs, azur par défaut.
- **Téléphone** : sur la peluche, l'écran d'un téléphone peut être recopié dans l'œil pour y utiliser ses propres applications. Voir `peluche/README.md` (kit d'installation de la carte, pas encore essayé sur du matériel).
- **Visages** : BOOZZO reconnaît les personnes qui se sont enregistrées et les salue par leur prénom. Tout tourne sur l'appareil avec face-api (`ui/face/`, open source, MIT) : l'empreinte du visage reste dans le navigateur et peut être effacée. Chaque personne s'enregistre avec son accord (celui d'un parent pour un enfant). La reconnaissance d'un vrai visage n'a pas encore été testée.
- **Recherche YouTube** : au clavier ou à la voix (« BOOZZO, mets des comptines sur YouTube »), la première vidéo trouvée se lance dans l'œil. Elle passe par le serveur et demande la variable `YOUTUBE_API_KEY` (clé gratuite de l'API YouTube Data v3, environ cent recherches par jour).
- **Histoires** : trois histoires intégrées, lancées au toucher ou à la voix, lues à voix haute dans l'œil. Les histoires et les petites réponses sont dites par une voix enregistrée (`ui/voix/`, générée avec Piper, voix « fr-siwis-medium » sous licence CC BY 4.0 : mentionner le jeu de données SIWIS dans les crédits du produit) : elle ne dépend pas de la voix de l'appareil. Après une modification de `ui/paroles.js`, régénérer les fichiers avec `tools/voix.py`. Les phrases imprévues (assistant, heure, prénoms) utilisent la voix de l'appareil.
- **Torche** : l'œil éclaire en blanc ou en veilleuse orangée. Sur un téléphone Android, la lampe du téléphone s'allume aussi ; l'iPhone ne le permet pas à une page web. Sur la peluche, une LED pourra être pilotée par la carte.
- **Heure** : horloge à grands chiffres rouges dans l'œil, façon réveil.
- **Météo** : le temps qu'il fait dans la ville de la personne (nom de ville ou position de l'appareil), avec les trois jours suivants. Données Open-Meteo, appelées directement depuis la page, sans clé ; gratuites pour un usage non commercial, à remplacer ou à licencier pour un produit vendu. Une carte animée montre les nuages (ou les pluies) des dernières heures autour de la ville : fond © contributeurs OpenStreetMap, images RainViewer ; ces deux services gratuits demandent une mention et ne conviennent pas tels quels à un produit vendu.
- **Forfait (eSIM)** : écran d'aperçu de l'abonnement mobile de la peluche, souscrit par un parent pour son enfant ou pour lui-même. Rien n'est vendu : les offres sont des exemples (`ESIM_OFFERS` dans `ui/app.js`). Pour l'ouvrir vraiment, il faut un modem 4G avec eSIM dans la peluche, un partenaire eSIM disposant d'une API de revente, un paiement en ligne et des conditions de vente.
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
| `YOUTUBE_API_KEY` | active la recherche YouTube |
| `HOST`, `PORT` | adresse d'écoute (`0.0.0.0` en ligne) |
| `DATA_DIR` | dossier de la base SQLite (`.local` par défaut) |
| `TURN_URLS`, `TURN_USERNAME`, `TURN_CREDENTIAL` | relais pour les appels sur réseaux mobiles |

## Sans serveur BOOZZO (démonstration)

Le dossier `ui/` peut être servi seul, par exemple sur GitHub Pages. Dans ce cas l'appel par lien fonctionne quand même : la mise en relation passe par le relais public de PeerJS (`ui/peerjs.min.js`, open source, licence MIT). Ce relais public n'offre aucune garantie de disponibilité ; pour un produit, utiliser le serveur BOOZZO ou son propre relais PeerServer (`window.BOOZZO_PEER = { host, port, path, secure }`). Les proches avec sonnerie et l'assistant, eux, demandent le serveur BOOZZO.

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
