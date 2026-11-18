# Mon agenda de devoirs (application web installable)

Application web progressive (PWA) : elle s'ouvre dans un navigateur, s'installe comme une vraie application sur tablette (iPad, Android) et sur ordinateur (Windows, Mac, Linux), et marche sans Internet.

## Contenu
- `index.html`, `styles.css`, `app.js` : l'application
- `manifest.webmanifest` : nom, icône, couleurs pour l'installation
- `sw.js` : fonctionnement hors ligne (changer `VERSION` à chaque mise à jour)
- `fonts/` : polices Andika et Lexend (licence SIL Open Font License), embarquées pour marcher hors ligne
- `icons/` : icônes de l'application

## Mettre en ligne
L'installation demande une adresse en `https://`. N'importe quel hébergeur de fichiers statiques convient : GitHub Pages, Netlify, Cloudflare Pages… Il suffit d'y déposer le contenu de ce dossier.

## Installer
- iPad : Safari > Partager > « Sur l'écran d'accueil »
- Android : Chrome > menu ⋮ > « Installer l'application »
- Ordinateur : Chrome ou Edge > icône d'installation dans la barre d'adresse ; Mac Safari > Fichier > « Ajouter au Dock »

## Données
Les devoirs sont enregistrés sur l'appareil (stockage du navigateur). Pour les copier d'un appareil à l'autre : Réglages (Aa) > « Créer un fichier de sauvegarde », puis « Récupérer une sauvegarde » sur l'autre appareil.
