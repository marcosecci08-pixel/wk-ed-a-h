# Hyderabad Week-end – instructions pour Claude Code

## Le projet

Appli web mobile qui guide Edith pendant son week-end culturel à Hyderabad (Inde),
les samedi 28 et dimanche 29 novembre 2026. Elle loge au Fairfield by Marriott
Hyderabad Gachibowli. L'appli est consultée sur téléphone, sur place, souvent avec
une connexion médiocre.

Lire `SPEC.md` avant d'écrire du code : il décrit les écrans et les règles.

## Fichiers

- `data/trip.json` : **source unique de vérité** (jours, événements, lieux, transport,
  sécurité, sources). Ne rien coder en dur qui s'y trouve déjà.
- `SPEC.md` : spécification fonctionnelle.
- `docs/Hyderabad_Weekend_28-29_novembre_2026.docx` : le planning d'origine, pour référence.
- `DEMARRAGE.md` : guide de démarrage pour Marco (pas pour toi).

## Règles

- Interface entièrement en **français**.
- **Mobile d'abord** (largeur 360 à 430 px), utilisable d'une main, zones tactiles d'au moins 44 px.
- **Hors ligne** : PWA installable sur l'écran d'accueil, tout le contenu disponible sans réseau
  après la première ouverture (service worker, `trip.json` mis en cache).
- Heures affichées dans le fuseau **Asia/Kolkata**, quel que soit le fuseau du téléphone.
- Pas de backend, pas de compte, pas de clé d'API. Les liens cartes sont de simples URL Google Maps
  construites à partir des coordonnées de `trip.json`.
- Pile par défaut : site statique simple (HTML, CSS, JavaScript, sans framework lourd).
  Si Marco indique que l'appli Japon utilisait une autre pile, reprendre celle-là.
- Ne pas inventer de contenu : pas de restaurants, tarifs, horaires ou numéros absents de `trip.json`.
  Les éléments marqués `a_confirmer`, `optionnel` ou `reservation_obligatoire` doivent être visibles comme tels.
- Photos : `assets/photos/<id du lieu>.jpg`, avec les crédits dans `assets/photos/credits.json`
  (affichés sous chaque photo). Les 7 photos actuelles viennent de Wikimedia Commons (CC BY-SA / CC0),
  téléchargées avec l'accord de Marco. Ne pas télécharger d'autres images sans son accord ;
  il peut remplacer un fichier par sa propre photo (retirer alors l'entrée correspondante de `credits.json`).
- Langues : interface et données en espagnol (par défaut) et en français. Les données françaises sont dans
  `data/trip.json`, les données espagnoles dans `data/trip.es.json` : toute modification de contenu
  doit être faite dans les deux fichiers. Les textes d'interface sont dans `js/app.js` via `L('français', 'español')`.
- Après toute modification du code ou des données, incrémenter `VERSION` dans `sw.js`.

## Vérification

Avant de dire que c'est terminé : lancer l'appli en local, vérifier les deux journées,
le mode hors ligne (réseau coupé après un premier chargement) et l'affichage en 390 px de large.
