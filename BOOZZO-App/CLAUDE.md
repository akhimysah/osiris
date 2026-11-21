# BOOZZO App

Application de l'œil de la peluche BOOZZO, en français. Lire README.md d'abord.

La peluche reste immobile ; seul le contenu de l'œil change. Garder le cadrage de la photo, l'iris azur par défaut et des voix douces. Le produit s'appelle BOOZZO (pas BEYBOO).

Sources dans `ui/`, `server.mjs` et `assistant.mjs`. `node dev.mjs` reconstruit `dist/` et sert l'application sur le port 4174. Le serveur doit rester au format worker (`fetch(req, env)`) pour pouvoir être hébergé tel quel ; ce qui dépend de Node (SDK Claude) passe par `env.ASSISTANT`, injecté par l'hôte.

Tester dans un navigateur après chaque changement, y compris un appel entre deux onglets. BOOZZO peut parler à des enfants : rester adapté à tous les âges.
