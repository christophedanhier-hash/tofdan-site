# Rapport — carte du ciel sensible au thème

Seul fichier modifié : `app/constellations/app.js` (non commité). Écrans 1 à 6, `js/main.js`, CSS, HTML, `data/`, `figures/` intacts ; ES5, sans lib.

## Changements
- `PALETTE_CARTE` (`sombre` / `clair`) + `paletteCarte()` en tête de fichier ; choix selon `data-theme === 'light'`.
- `dessinerPolaire()` et `dessinerZoom()` : plus aucune couleur d'affichage en dur (vérifié par grep).
- Clés ajoutées aux 11 du brief : `horizon`, `nomSel` (nom de la constellation sélectionnée), `nomEtoile` (noms d'étoiles du zoom), car ces couleurs (`#f0a040`, `#ffd25a`, `#ffe9a8`) étaient aussi en dur.
- `MutationObserver` sur `data-theme` (`themeChange`) : redessine polaire + zoom (`CARTE.redessiner`) uniquement si l'écran carte est actif.
- Écart mineur : le zoom utilisait des alphas légèrement différents (0,95 / 0,4) ; il partage désormais `traceActif` / `trace` avec la polaire.

## Palettes
| clé | sombre | clair |
|---|---|---|
| fond | `#07101f` | `#fbf9f4` |
| disque | `#0d1b33` | `#f1ecdf` |
| grille | `rgba(150,170,210,0.22)` | `rgba(60,60,60,0.22)` |
| grilleTexte | `rgba(170,185,215,0.7)` | `#555555` |
| sousHorizon | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.12)` |
| horizon | `#f0a040` | `#b45f00` |
| trace | `rgba(90,140,235,0.5)` | `rgba(26,79,139,0.6)` |
| traceActif | `rgba(255,210,90,0.9)` | `#b8860b` |
| etoile | `#ffffff` | `#222222` |
| etoileFaible | `rgba(190,200,220,0.6)` | `rgba(102,102,102,0.7)` |
| etiquette | `rgba(150,185,255,0.95)` | `#1a4f8b` |
| nomSel | `#ffd25a` | `#7a5200` |
| nomEtoile | `#ffe9a8` | `#6b4a00` |
| infoFond | `rgba(7,16,31,0.7)` | `rgba(251,249,244,0.85)` |

## Vérifications (Chrome headless + Playwright, thème par `#theme-toggle`)
1. dark → pixel de fond `7,16,31` ; clic → `light`, pixel `251,249,244` sur les 2 canvas (polaire et zoom) : **OK**.
2. Retour en dark → `7,16,31` ; aucune erreur console / pageerror : **OK**.
3. Capture claire inspectée : grille, heures, noms, abréviations lisibles (textes foncés sur `#fbf9f4`) : **OK**.
4. Écrans 1-6 : `git diff` ne touche aucune `function ecran1..6` : **OK**.

## Difficultés
- Le port 8765 était occupé par une autre application ; test refait sur un serveur statique temporaire (arrêté).
- Le contraste n'a été jugé qu'à l'œil sur capture, pas calculé par outil.
