# App constellations — Lot 0 (squelette fonctionnel)

**Date** : 2026-10-12 · **Auteur** : Gérard (orchestration) + Copilot CLI (code)
**Commit** : `bef40e6` · **Modèle Copilot** : `claude-sonnet-5.5`

## Livré

6 fichiers, 722 lignes, dans `app/constellations/` :

| Fichier | Lignes | Rôle |
|---|---|---|
| `index.html` | 19 | coquille + lien retour |
| `app.js` | 321 | logique des 5 écrans |
| `app.css` | 46 | thème clair |
| `data/aigle.json` | 306 | copie du JSON validé (SHA vérifié) |
| `data/index.json` | 11 | catalogue (1 constellation) |
| `README.md` | 19 | note d'usage |

## Les 5 écrans (tous testés au navigateur)

1. Accueil — titre + « Commencer »
2. Fiche élève — tableau des 8 étoiles (Bayer, magnitude, rôle, visibilité)
3. Dessin — canvas 800×600, épaisseur, couleur, repères activables
4. Comparaison — dessin de l'élève vs corrigé (2 canvas)
5. Questions — 5 questions du guide, réponses révélables

## Conformité vérifiée

- ✅ 0 dépendance externe (aucun CDN)
- ✅ 0 lien vers `/hermes/`
- ✅ Aucune donnée d'étoile en dur dans `app.js` (tout vient du JSON)
- ✅ Thème clair (cohérent site astro)
- ✅ JSON fournis **inchangés** (SHA256 vérifiés avant/après)
- ✅ `git status` : **aucun fichier existant modifié** (isolation totale)

## Correction apportée au brief

Le brief demandait `href="../app-astro.html"` — **faux** : depuis
`app/constellations/`, il faut **deux crans** (`../../app-astro.html`), car
`app-astro.html` est à la **racine** du site, pas dans `app/`.
Copilot a suivi le brief à la lettre ; **c'est le brief qui était faux.**

## Reste à faire (Lot 1)

- 48 fiches constellations restantes
- Compléter les 5 fiches pauvres
- Restituer les cartes / les 13 lettres grecques manquantes
- Insertion dans la navigation (`app-astro.html`)

## Vérification

```bash
python3 /home/tofdan/.hermes/profiles/gerard/scripts/verif-lot0.py
# attendu : OK 10 / PROBLEMES 0
```
