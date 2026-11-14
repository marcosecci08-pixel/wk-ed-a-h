# Démarrage

## Contenu du paquet

| Fichier | Rôle |
|---|---|
| `CLAUDE.md` | Instructions lues automatiquement par Claude Code |
| `SPEC.md` | Spécification de l'appli (écrans, règles, critères d'acceptation) |
| `data/trip.json` | Toutes les données du week-end : 2 jours, 15 événements, 7 lieux |
| `docs/Hyderabad_Weekend_28-29_novembre_2026.docx` | Le planning au format Word |
| `assets/photos/` | Dossier vide, pour vos propres photos |

## Étapes

1. Décompresser `hyderabad-app.zip` dans votre dossier de projets.
2. Ouvrir un terminal dans le dossier `hyderabad-app`, puis lancer `claude`.
3. Coller le message ci-dessous.

## Message à coller dans Claude Code

```
Lis CLAUDE.md, SPEC.md et data/trip.json.

Construis l'appli web décrite dans SPEC.md : une PWA mobile, en français,
utilisable hors ligne, qui affiche le planning du week-end à partir de
data/trip.json sans rien coder en dur.

Commence par me proposer la structure des fichiers et la pile technique
en quelques lignes, puis construis l'appli écran par écran en suivant
l'ordre de la section 4 de SPEC.md.

Quand c'est fait, lance-la en local et vérifie les critères d'acceptation
de la section 8, y compris le mode hors ligne et l'affichage à 390 px.
```

Si vous voulez la même pile que pour l'appli Japon, ajoutez une phrase du type :
« Reprends la même pile et la même organisation que mon projet Japon, situé dans <chemin du dossier>. »

## Avant le départ d'Edith

- Réserver le high tea au Taj Falaknuma Palace (ou retirer l'étape).
- Faire confirmer par l'hôtel l'horaire du son et lumière de Golconde.
- Choisir les restaurants des deux déjeuners, puis les ajouter dans `data/trip.json`.
- Lui faire installer l'appli sur l'écran d'accueil et l'ouvrir une fois avec du réseau,
  pour que le contenu soit disponible hors ligne.
