# Constellations — Lot 0

App mono-page (HTML/CSS/JS vanilla, canvas 2D, `localStorage`, aucun réseau externe) pour apprendre les constellations.

## Fichiers
- `index.html`, `app.js`, `app.css` : l'application.
- `data/index.json` : liste des constellations disponibles.
- `data/<id>.json` : une constellation (source de vérité, non modifiée par l'app).

## Lancer
Le chargement utilise `fetch` : servir le dossier par HTTP, par ex. `python3 -m http.server` puis ouvrir `/app/constellations/`.

## Écrans
1. Accueil · 2. Fiche élève · 3. Dessin · 4. Comparaison · 5. Questions.

Progression : `localStorage`, clé `constellations.progression`, objet `{ "<id>": <étape> }`. Les traits dessinés ne sont conservés qu'en mémoire (perdus au rechargement).

## Architecture
Aucune valeur astronomique en dur : étoiles, liaisons (paires d'index `i`) et questions viennent du JSON. Projection stéréographique centrée sur le barycentre, ajustée au canvas 800×600 avec 60 px de marge. Pour ajouter une constellation : déposer son JSON dans `data/` et l'ajouter à `data/index.json`. Au Lot 0, l'app charge la constellation de la progression sauvegardée, sinon la première de l'index (pas encore de sélecteur).
