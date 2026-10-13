# Rapport — segments IAU non tracés

## Correctif
`app/constellations/app.js` uniquement : ajout de `segmentsFigure(liaisons)` (ES5) qui aplatit
paires et chaînes en paires `[a, b]`. Utilisée aux 3 endroits qui lisent `figure.liaisons` :
- écran 4 : `var liaisons = segmentsFigure(d.figure.liaisons)` — alimente le tracé du corrigé,
  la sélection/distance (`texteSegment`, `distanceLiaison`) et `segmentProche` (survol/clic) ;
- carte du ciel : 2 boucles de tracé (vue d'ensemble et vue zoom).

Aucun fichier `data/*.json`, `js/main.js` ou `css/style.css` modifié.

## Segments par fiche (49 fiches)

| # | Fiche | Réels | Tracés avant | Tracés après |
|---|---|---|---|---|
| 1 | Aigle | 4 | 4 | 4 |
| 2 | Andromède | 7 | 7 | 7 |
| 3 | Balance | 6 | 6 | 6 |
| 4 | Baleine | 9 | 9 | 9 |
| 5 | Bouvier | 6 | 6 | 6 |
| 6 | Cancer | 4 | 4 | 4 |
| 7 | Capricorne | 6 | 6 | 6 |
| 8 | Cassiopée | 4 | 4 | 4 |
| 9 | Céphée | 11 | 11 | 11 |
| 10 | Chevelure de Bérénice | 2 | 2 | 2 |
| 11 | Chiens de Chasse | 1 | 1 | 1 |
| 12 | Cocher | 7 | 7 | 7 |
| 13 | Coupe (Cratère) | 8 | 8 | 8 |
| 14 | Couronne Boréale | 6 | 6 | 6 |
| 15 | Cygne | 13 | 13 | 13 |
| 16 | Dauphin | 6 | 6 | 6 |
| 17 | Dragon | 14 | 14 | 14 |
| 18 | Écu de Sobieski | 4 | 4 | 4 |
| 19 | Flèche | 3 | 3 | 3 |
| 20 | Gémeaux | 16 | 5 | 16 |
| 21 | Girafe | 7 | 2 | 7 |
| 22 | Grand Chien | 11 | 2 | 11 |
| 23 | Grande Ourse | 7 | 7 | 7 |
| 24 | Hercule | 22 | 5 | 22 |
| 25 | Hydre | 20 | 2 | 20 |
| 26 | Lézard | 10 | 1 | 10 |
| 27 | Licorne | 9 | 3 | 9 |
| 28 | Lièvre | 12 | 2 | 12 |
| 29 | Lion | 17 | 4 | 17 |
| 30 | Lynx | 7 | 1 | 7 |
| 31 | Lyre | 7 | 1 | 7 |
| 32 | Ophiuchus | 18 | 3 | 18 |
| 33 | Orion | 8 | 8 | 8 |
| 34 | Pégase | 11 | 4 | 11 |
| 35 | Persée | 21 | 5 | 21 |
| 36 | Petit Cheval | 1 | 1 | 1 |
| 37 | Petit Chien | 1 | 1 | 1 |
| 38 | Petit Renard | 1 | 1 | 1 |
| 39 | Petite Ourse | 7 | 1 | 7 |
| 40 | Poissons | 18 | 1 | 18 |
| 41 | Poupe | 11 | 2 | 11 |
| 42 | Sagittaire | 13 | 2 | 13 |
| 43 | Scorpion | 17 | 2 | 17 |
| 44 | Serpent | 11 | 2 | 11 |
| 45 | Sextant | 3 | 1 | 3 |
| 46 | Taureau | 11 | 3 | 11 |
| 47 | Triangle | 3 | 1 | 3 |
| 48 | Verseau | 17 | 5 | 17 |
| 49 | Vierge | 14 | 3 | 14 |
| | **Total** | **452** | **202** | **452** |

Avant : 202 / 452 tracés (250 perdus, 55 %). Après : 452 / 452.

## Mesure au rendu (Gémeaux, écran 4, canvas du corrigé, pixels `#1a4f8b`)
Page `http://100.92.102.28:8943/app/constellations/index.html`, Chrome headless,
`getImageData` (pixels exacts 26,79,139, alpha 255). L'ancien et le nouveau `app.js`
ont été injectés dans la même page.

| | Pixels bleus |
|---|---|
| Avant | **960** |
| Après | **2821** |

Contrôle visuel : la figure montre les deux silhouettes des jumeaux (Castor/Pollux),
avec les 17 étoiles reliées.

## Syntaxe
`node --check app/constellations/app.js` → OK.
