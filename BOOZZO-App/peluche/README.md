# Kit de la peluche BOOZZO

Ce dossier transforme un Raspberry Pi relié à l'écran de l'œil en peluche BOOZZO : l'œil s'affiche tout seul au démarrage, et un téléphone peut y recopier son écran pour utiliser ses propres applications.

**Ce kit n'a pas encore été essayé sur du matériel.** Le script a été relu et sa syntaxe vérifiée, mais chaque étape reste à confirmer sur la carte.

## Matériel

- Raspberry Pi 5 (ou 4) avec Raspberry Pi OS « avec bureau », relié au Wi-Fi.
- L'écran de l'œil en HDMI, plus son câble USB pour le tactile.
- Une caméra USB, un micro et un haut-parleur (les webcams USB ont souvent un micro).
- L'application BOOZZO déjà en ligne en HTTPS (voir le README du dossier parent).

## Installation

Sur la carte, dans un terminal :

```sh
git clone -b claude/boozzo-prototype-lab-xghudf https://github.com/akhimysah/osiris.git
bash osiris/BOOZZO-App/peluche/install.sh https://votre-adresse.onrender.com
sudo reboot
```

Après le redémarrage, l'œil de BOOZZO occupe tout l'écran. Si l'écran est carré, le cercle de l'œil est centré et les coins restent noirs.

## Recopier un iPhone dans l'œil

1. L'iPhone et la peluche sont sur le même Wi-Fi.
2. Sur l'iPhone : Centre de contrôle, « Recopie de l'écran », puis « BOOZZO ».
3. L'écran de l'iPhone remplace l'œil, avec le son. Toutes les applications du téléphone s'y affichent, y compris un appel WhatsApp.
4. « Arrêter la recopie » sur l'iPhone ramène l'œil de BOOZZO.

Limites : on pilote depuis le téléphone, pas en touchant l'œil (Apple ne le permet pas) ; la caméra et le micro de l'appel sont ceux du téléphone ; l'écran du téléphone est en hauteur, donc affiché avec des bandes noires ; certaines applications de streaming (Netflix…) s'affichent en noir.

## Recopier un téléphone Android

1. Sur le téléphone, activer les options pour les développeurs puis le « débogage USB ».
2. Relier le téléphone à la carte en USB et accepter l'autorisation qui s'affiche sur le téléphone.
3. Lancer `boozzo-android` sur la carte (clavier ou connexion à distance).

Avec Android, l'écran s'affiche et se pilote aussi en touchant l'œil. Il n'y a pas encore de bouton dans l'œil pour lancer cette recopie.

## Ce que le script installe

| Programme | Rôle | Licence |
|---|---|---|
| Chromium | affiche l'œil en plein écran, caméra et micro autorisés | BSD |
| UxPlay | récepteur AirPlay nommé « BOOZZO » | GPL-3.0 |
| scrcpy, adb | recopie et pilotage d'un téléphone Android | Apache-2.0 |
| unclutter | masque le curseur de la souris | GPL |

Trois lancements automatiques sont créés dans `~/.config/autostart/`. Pour revenir au bureau normal, supprimer les fichiers `boozzo-*.desktop` de ce dossier et redémarrer.

## À vérifier sur la carte

- Que la fenêtre de recopie passe bien au-dessus de l'œil et se ferme à l'arrêt.
- Que le tactile de l'écran est reconnu et bien orienté.
- Que la caméra et le micro USB sont utilisés par les appels.
- Les performances vidéo des appels sur la carte choisie.
