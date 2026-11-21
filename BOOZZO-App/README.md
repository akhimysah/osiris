# BOOZZO — l'application de l'œil

Application web de la peluche BOOZZO. La peluche reste immobile : tout se passe dans son œil, un écran rond. Elle fonctionne dès maintenant dans un navigateur (téléphone ou ordinateur) et est prévue pour tourner telle quelle sur l'écran rond du futur prototype.

## Ce que fait l'application

- **Menu rond** dans l'œil : Appels, YouTube, Photo, Assistant, Histoires, Iris.
- **Appels vidéo dans l'œil** entre deux appareils : BOOZZO ouvre un appel, le proche scanne un QR code ou ouvre un lien sur son téléphone, sans rien installer. Chacun voit et entend l'autre (WebRTC).
- **Voix** : bouton micro, ou écoute continue du mot « BOOZZO ». Exemples : « BOOZZO, mets YouTube », « BOOZZO, appelle », « prends une photo », « mets l'iris en violet », « raccroche ».
- **Assistant** : toute phrase qui n'est pas une commande est envoyée à l'assistant, qui répond à voix haute, phrase par phrase, dans l'œil. « Histoires » lui demande une histoire douce.
- **YouTube** : lecture d'une vidéo dans l'œil à partir de son lien ; les favoris nommés se lancent à la voix.
- **Photo** : retour caméra dans l'œil, prise de vue, dernières photos gardées sur l'appareil.
- **Iris** : quatre couleurs, azur par défaut.

## Démarrer

Node.js 22.13 ou ultérieur.

```sh
npm install
node dev.mjs
```

Ouvrir http://127.0.0.1:4174.

- `/?oeil` affiche l'œil seul, en plein écran : c'est la vue destinée à l'écran rond du prototype.
- `/?appel=<identifiant>` est la page du proche qui répond à un appel.

### Brancher l'assistant

L'assistant utilise l'API Claude. Sans clé, tout le reste fonctionne et l'assistant indique qu'il n'est pas branché.

```sh
ANTHROPIC_API_KEY=... node dev.mjs
```

La clé reste sur le serveur ; elle n'est jamais envoyée au navigateur. Chaque réponse est facturée à l'usage sur le compte de la clé.

## Organisation

- `ui/index.html`, `ui/style.css`, `ui/app.js` : l'interface (peluche, œil, panneau de commandes).
- `server.mjs` : routes HTTP au format « worker » (`fetch(req, env)`), stockage via `env.BUCKET`.
- `assistant.mjs` : appel à l'API Claude (SDK officiel) et personnalité de BOOZZO.
- `dev.mjs` : serveur local, stockage SQLite dans `.local/`.
- `build.mjs` : assemble `ui/` et `server.mjs` dans `dist/server/index.js`.

## Limites connues

- Caméra, micro et appels exigent HTTPS dès qu'on quitte `127.0.0.1`. Pour un appel entre deux vrais téléphones, l'application doit être hébergée en HTTPS.
- Les appels utilisent un serveur STUN public. Sur certains réseaux (4G, Wi-Fi d'entreprise), il faudra ajouter un relais TURN.
- La reconnaissance vocale dépend du navigateur (Chrome, Safari). L'écoute continue du mot « BOOZZO » est expérimentale.
- WhatsApp, Spotify et les autres applications tierces ne sont pas intégrés : les appels sont ceux de BOOZZO.
- Pas de reconnaissance faciale ni de comptes utilisateurs pour l'instant.
