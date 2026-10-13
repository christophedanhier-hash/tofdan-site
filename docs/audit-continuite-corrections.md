# Corrections de continuité — fiches constellation

Source des données : `/tmp/lot4-maj-donnees.json` (82 objets). Tous les chiffres ci-dessous ont été mesurés (avant = `git HEAD`, après = fichiers modifiés) sur les 49 fiches de `app/constellations/data/` (hors `index.json`).

## Mesures

| Mesure | Avant | Après |
|---|---|---|
| Objets à 5 clés | 82 (12 fiches : lion, petit-renard, poissons, poupe, sagittaire, scorpion, serpent, sextant, taureau, triangle, verseau, vierge) | **0** |
| Objets à 8 clés | 182 | 264 |
| Nature `objet` | 81 | **0** |
| Code `N2` | 0 | 82 |
| Étoiles à `role` vide | 187 | 385 |
| Étoiles à `role` rempli | 266 | 68 |
| Étoiles dont `role` a été vidé | — | **198** (gabarits « Étoile de la figure (mag », « Repère majeur (mag », « Magnitude x. ») |
| `visibilite` | `œil nu` 265 ; « visible à l'œil nu par nuit claire » 84 ; « brillante, visible à l'œil nu » 83 ; « très brillante… » 20 ; `jumelles` 1 | `œil nu` **452** ; `jumelles` **1** (total 453) |
| `json.load` OK | — | 49/49 |

Instrument des 82 objets traités : `instrument non déterminé` 75, `télescope` 4, `jumelles` 3.
Répartition finale globale de `instrument` (264 objets) : `instrument non déterminé` 82, `télescope` 48, `jumelles` 48, `instrument` 31, `lunette` 25, `œil nu` 22, `grand télescope` 3, `petit télescope` 1, `null` 4.

Répartition finale de `nature` (264 objets) : galaxie 84, amas ouvert 68, amas globulaire 40, nébuleuse planétaire 21, amas + nébuleuse 13, nébuleuse 9, nébuleuse en émission 8, autres valeurs historiques inchangées.

## Ce qui a été fait

- 82 objets : ajout de `instrument`, `src`, `code` ; `nature` remplacée par la valeur fournie (M 45, M 24, M 25 reprises du fichier fourni telles quelles).
- `src` = `NGC 2000.0 (catalogue VII/118) ; fiche Atlas p. <N>` (pages de `source_atlas`, ex. `p. 91-93`).
- Aucun code existant dans la légende des 12 fiches (`refs` vide) → code `N2` et ligne ajoutée dans `referentiel_sources.lignes` de chacune des 12 fiches.
- `role` vidé (`""`) sur 198 étoiles ; `visibilite` normalisée ; aucune étoile en `instrument`, aucune valeur hors des 3 autorisées.
- Fichiers touchés : 40 (les 12 fiches + 28 fiches pour `role`/`visibilite`). Format d'indentation de chaque fichier préservé. Rien dans `js/`, `css/`, SVG, `index.html`.

## Signalements (à trancher par le producteur)

1. **Qualificatifs de désignation dans `nature`** (non corrigés) : cygne — NGC 6888 `nébuleuse en émission (Croissant)`, IC 5070 `nébuleuse en émission (Pélican)`, NGC 6960 / NGC 6979 / NGC 6992 `rémanent de supernova (Dentelles)` ; dragon — NGC 5866 `galaxie lenticulaire (M 102)`.
2. **Incohérence du brief** : il cite M 93 et NGC 2437 comme ayant un instrument explicite ; le fichier fourni donne `null` pour ceux-ci et une valeur pour **NGC 2438** (poupe) et **M 16** (serpent). Les 7 valeurs du fichier ont été appliquées : NGC 2438 télescope, M 4 jumelles, NGC 6357 jumelles, M 16 télescope, M 2 jumelles, NGC 7009 télescope, NGC 7293 télescope (l'Atlas dit « petit télescope » pour NGC 2438 et NGC 7293 ; le fichier fourni les normalise en `télescope`).
3. Les 12 fiches avaient `referentiel_sources.refs = []` ; la légende est ajoutée sous la clé `lignes` (comme dans les fiches historiques), `refs` reste vide.
4. 4 objets historiques ont `instrument` = `null` (préexistant, non touché).
5. Aucune étoile n'a la visibilité `instrument`.
6. Objet `M 45` : nature déjà `amas ouvert` avant modification (seul des 82 non `objet`).

## Laissé intact

`distance_al` (`null` : chiffre du brief, NON MESURÉ ici) et magnitudes `null` : chantiers séparés. Clé `eclat` non ajoutée. `role` non rempli (contenu astronomique = Gérard).
