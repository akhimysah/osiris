# BeyaBear’s — application de l’œil

Application de l'œil de la peluche BeyaBear’s, en français. Lire README.md d'abord.

La peluche reste immobile ; seul le contenu de l'œil change. Garder le cadrage de la photo (ourson.webp, écran rond au centre), l’iris azur par défaut et des voix douces. Le produit s’appelle BeyaBear’s (BOOZZO et BEYBOO sont d’anciens noms à ne plus afficher) ; à la voix, on l’appelle « Beya ».

Sources dans `ui/`, `server.mjs` et `assistant.mjs`. Dans `ui/`, `labo.js` porte les applications du laboratoire (Émotions, Cœur, Lien, Souvenirs, Nuit, Socle, Localisation, Musique), toutes des simulations visuelles sans capteur ni réseau, et `traduire.js` traduit l'interface en anglais et en espagnol : tout nouveau texte affiché doit y être ajouté. `node dev.mjs` reconstruit `dist/` et sert l'application sur le port 4174. Le serveur doit rester au format worker (`fetch(req, env)`) pour pouvoir être hébergé tel quel ; ce qui dépend de Node (SDK Claude) passe par `env.ASSISTANT`, injecté par l'hôte.

Tester dans un navigateur après chaque changement, y compris un appel entre deux onglets. BeyaBear’s peut parler à des enfants : rester adapté à tous les âges.
