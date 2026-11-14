# Spécification – appli web « Hyderabad Week-end »

## 1. Objectif

Donner à Edith, sur son téléphone, le planning de ses deux journées de visite à Hyderabad :
quoi faire, à quelle heure, comment s'y rendre, et les consignes utiles sur place.
L'appli doit rester utilisable sans connexion.

## 2. Utilisatrice et contexte

- Une seule utilisatrice, en déplacement, téléphone en main, parfois en plein soleil.
- Elle se déplace en voiture avec chauffeur ou en Uber/Ola.
- Connexion mobile irrégulière, surtout dans la vieille ville.

## 3. Données

Tout vient de `data/trip.json`.

| Clé | Contenu |
|---|---|
| `meta` | titre, dates, fuseau (`Asia/Kolkata`), date de vérification des données |
| `hotel` | nom, adresse, coordonnées, téléphone |
| `lieux` | les 7 sites : coordonnées, horaires, description, téléphone, site web, tarif indicatif |
| `jours` | 2 journées, chacune avec ses `evenements` ordonnés |
| `transport` | recommandation, options avec avis, temps de trajet |
| `securite`, `pratique` | listes de consignes |
| `a_confirmer` | points encore ouverts |
| `sources` | liens des sources |

Un événement a un `type` : `trajet`, `visite`, `repas`, `spectacle` ou `pratique`.
Il peut porter `lieu_id` (renvoi vers `lieux`), `fin`, `conseils`, `optionnel`,
`reservation_obligatoire`, `a_confirmer`.

## 4. Écrans

### 4.1 Aujourd'hui (écran d'accueil)

- Avant le 28 novembre : compte à rebours et aperçu des deux journées.
- Le 28 ou le 29 : la journée en cours, avec l'événement **en cours** et le **suivant** mis en avant
  (calcul à partir de l'heure à Hyderabad).
- Après le 29 : les deux journées en consultation libre.

### 4.2 Journée

- Onglets « Samedi » et « Dimanche ».
- Frise chronologique verticale : heure, titre, type (pictogramme), durée.
- Pastilles visibles pour « Optionnel », « Réservation obligatoire » et « À confirmer ».
- Les événements passés sont atténués.

### 4.3 Détail d'un événement ou d'un lieu

- Description, horaires d'ouverture, tarif indicatif, conseils.
- Bouton **Itinéraire** : ouvre Google Maps vers les coordonnées du lieu.
- Bouton **Appeler** si un téléphone existe, lien vers le site officiel s'il existe.
- Emplacement photo (image locale facultative, sinon aplat de couleur).

### 4.4 Carte

- Vue d'ensemble des sites et de l'hôtel, colorés par journée.
- Solution légère et compatible hors ligne : schéma SVG calculé à partir des coordonnées,
  avec un lien « Ouvrir dans Google Maps » pour chaque point. Pas de carte nécessitant une clé d'API.

### 4.5 Pratique

- Transport : recommandation, puis options avec leur avis
  (`recommande`, `possible`, `a_eviter`, `sans_interet_ici`) et temps de trajet.
- Sécurité, conseils pratiques, points à confirmer.
- Bouton **Appeler l'hôtel** et numéro d'urgence 112, toujours accessibles.
- Sources, avec la date de vérification des données.

## 5. Exigences

- PWA : manifeste, icône, service worker, fonctionnement hors ligne complet.
- Mobile d'abord, contraste élevé (lecture en plein soleil), thème clair et thème sombre.
- Texte agrandissable sans casser la mise en page.
- Temps de premier affichage court : pas de dépendance lourde.
- Déployable comme site statique (GitHub Pages, Netlify ou équivalent).

## 6. Direction visuelle

Inspiration : l'Hyderabad des Nizams. Tons de grès et d'ocre, un accent turquoise
(les faïences des tombeaux Qutb Shahi), typographie lisible à grande taille.
Sobre : c'est un outil de terrain, pas une brochure.

## 7. Hors périmètre

- Pas de compte, de synchronisation ni de serveur.
- Pas de réservation en ligne.
- Pas de contenu généré : restaurants, prix ou horaires absents de `trip.json` ne sont pas inventés.

## 8. Critères d'acceptation

1. Les 15 événements des deux journées s'affichent dans l'ordre, avec les bonnes heures.
2. Le 28 novembre à 15 h 45 (heure d'Hyderabad), « Fort de Golconde » apparaît comme étape en cours.
3. Réseau coupé après un premier chargement : tous les écrans restent consultables.
4. Chaque lieu ouvre le bon point dans Google Maps.
5. Le high tea du Falaknuma est signalé comme optionnel et sur réservation ;
   le son et lumière est signalé « à confirmer ».
6. Affichage correct à 390 px de large, sans défilement horizontal.
