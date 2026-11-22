# BOOZZO — briques open source et choix techniques

Recensement fait le 22 novembre 2026 par recherche web. Les points marqués « à vérifier » n'ont pas pu être confirmés à la source.

## Pile recommandée pour un premier prototype

| Sujet | Choix | Licence | Remarque |
|---|---|---|---|
| Mot de réveil « BOOZZO » | livekit-wakeword, entraîné sur le mot en français | Apache-2.0 (code) | Tourne dans le navigateur. Français non cité explicitement : à entraîner et tester sur de vraies voix. Repli : openWakeWord (modèles fournis non commerciaux). Porcupine est payant. |
| Reconnaissance vocale | Vosk `small-fr` pour les commandes ; Whisper large-v3-turbo pour les phrases libres | Apache-2.0 / MIT | Vosk est léger et hors ligne ; Whisper est plus précis mais lourd. |
| Voix française douce | Kokoro `ff_siwis` (kokoro-js) | Apache-2.0 | Une seule voix française : à écouter avant de décider. Repli : Piper `siwis`, licence de la voix à vérifier. |
| Reconnaissance faciale | Human (vladmandic) pour la démo ; YuNet + SFace (OpenCV Zoo) pour un produit vendu | MIT / Apache-2.0 | InsightFace est interdit en usage commercial. Empreintes à garder sur l'appareil. |
| Appels (relais réseau) | Cloudflare Realtime TURN | 1 000 Go/mois gratuits | Ou coturn / eturnal en auto-hébergement. Se branche via `TURN_URLS`. |
| Notification d'appel | Web Push (`web-push` sur Node) | MIT | Sur iPhone, le proche doit ajouter la page à l'écran d'accueil. Ce n'est pas un écran d'appel plein écran. |
| WhatsApp | WhatsApp Web en appareil lié, ou l'application Android officielle | officiel | Voir ci-dessous. |
| Matériel | Écran rond Waveshare 7" 1080×1080 HDMI tactile + Raspberry Pi 5 | — | Aucune dalle ronde de 6,5" trouvée. Linux + Chromium en plein écran, ou Android 16 (build communautaire KonstaKANG). |
| YouTube à la voix | YouTube Data API v3 + lecteur officiel | gratuit | Environ 100 recherches par jour pour tout le projet : mettre en cache. Vérifier `madeForKids` avant d'intégrer une vidéo. |

## WhatsApp : ce qui est possible

- **WhatsApp Web** gère les appels audio et vidéo dans le navigateur (bêta en février 2026, déploiement général fin juillet 2026). C'est la voie officielle la plus directe : l'œil ouvre `web.whatsapp.com` comme appareil lié au compte. Fonctionnement sur Chromium ARM en plein écran : à vérifier sur le matériel.
- **Application Android officielle** sur une carte Android : voie la plus robuste si le prototype tourne sous Android.
- **API d'appel WhatsApp Business** : pensée pour entreprise ↔ client, appels voix ; vidéo non confirmée. Ne convient pas à un compte personnel.
- **Bibliothèques non officielles** (Baileys, whatsmeow, meowcaller) : pas d'appels vidéo fiables, interdites par les conditions de WhatsApp, risque de bannissement du compte. À exclure.

Aucune application tierce n'est conçue pour un écran rond : soit on accepte des coins coupés, soit on l'affiche dans un carré inscrit (environ 764×764 sur 1080).

## Reconnaissance faciale : cadre légal (à valider par un juriste)

- Une empreinte de visage servant à identifier quelqu'un est une donnée sensible (RGPD, article 9) : consentement explicite de chaque personne, et des parents pour un enfant.
- À prévoir : empreintes stockées et comparées uniquement sur l'appareil, enrôlement volontaire, suppression simple, fonctionnement possible sans visage, analyse d'impact.
- Règlement européen sur l'IA : la vérification « est-ce bien cette personne ? » d'une personne enrôlée volontairement n'est pas classée à haut risque ; les jouets relèvent en plus de la législation produit.

## Points à vérifier

- WhatsApp Web et lecture Spotify (contenu protégé) sur Chromium ARM/Linux.
- Caméra, micro et tactile de l'écran Waveshare sous Android sur Raspberry Pi 5.
- Licences exactes des voix françaises (Piper, Kokoro) et du modèle d'identité de Human.
- Comportement d'une notification d'appel sur iPhone verrouillé en France.
- Coût réel actuel d'une recherche YouTube par l'API.

## Sources principales

- https://github.com/livekit/livekit-wakeword · https://github.com/dscripka/openWakeWord
- https://alphacephei.com/vosk/models · https://github.com/xenova/whisper-web
- https://www.npmjs.com/package/kokoro-js · https://github.com/Mintplex-Labs/piper-tts-web
- https://github.com/vladmandic/human · https://github.com/opencv/opencv_zoo
- https://developers.cloudflare.com/realtime/turn/faq/ · https://github.com/coturn/coturn/
- https://blog.whatsapp.com/introducing-web-calling-on-whatsapp-plus-more-new-updates
- https://www.waveshare.com/product/displays/7inch-1080x1080-lcd.htm · https://konstakang.com/devices/rpi5/AOSP16/
- https://developers.google.com/youtube/v3/determine_quota_cost
- https://ai-act-service-desk.ec.europa.eu/en/ai-act/annex-3 · https://cnil.fr/fr/enfants-et-ados/jouets-et-objets-connectes
