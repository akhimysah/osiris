# BOOZZO Lab — kit développeur

## Démarrer sur ordinateur

Décompressez tout le ZIP dans un dossier. Installez Node.js 22.13 ou ultérieur. Ouvrez un terminal dans le dossier BOOZZO-Lab et lancez la commande suivante.

```sh
node dev.mjs
```

Ouvrez http://127.0.0.1:4173 dans le navigateur de cet ordinateur. Le lancement utilise les modules fournis avec Node. Après une modification, arrêtez le serveur avec Ctrl+C, relancez la commande et rechargez la page.

## Modifier avec Claude

Ouvrez le dossier décompressé dans Claude Code. Si vous utilisez un chat Claude sans accès au dossier, joignez le fichier à modifier, le fichier CLAUDE.md et les fichiers associés selon la demande.

- ui/index.html définit l'écran principal et la console.
- ui/style.css règle la présentation de la peluche et la position de l'œil.
- ui/app.js pilote les médias, l’iris bleu azur, les fiches et les comptes rendus.
- ui/exploratrice.jpeg est la photo originale de BOOZZO.
- server.mjs contient les routes HTTP et l’accès au stockage BUCKET.
- build.mjs assemble l’interface et le serveur dans dist/server/index.js.
- dev.mjs lance la copie de développement et enregistre ses propres données dans .local/boozzo.sqlite.

## Essais

Vérifiez l’iris bleu à l’ouverture, changez sa couleur, puis alternez entre la peluche et l’œil agrandi. Enregistrez une observation de démonstration et vérifiez sa présence dans l’historique après redémarrage.

Le serveur local est accessible depuis l’ordinateur de développement. Pour tester le QR avec un deuxième téléphone, utilisez une instance de test HTTPS privée accessible aux deux appareils. Le QR ouvre une session de test. L’accès aux contacts, l’appel WhatsApp, Safari natif et l’identification faciale sur le matériel nécessitent leurs propres intégrations et validations.

Le ZIP contient les sources et les visuels. Les essais privés et les droits de publication restent sur le site de Hicham. La copie locale peut être modifiée indépendamment.
