# Audit de continuité — fiches constellation (tofdan.be)

**Date** : 2026-10-13 · **Périmètre** : 49 fiches publiées (Lots 1-4)
**Demande** : Christophe — « sur les objets […] l'implémentation et le contenu n'est pas de la même facture,
avec des colonnes manquantes […] une audit sur l'ensemble pour remettre cela d'équerre, aucune régression ».

## Méthode
Audit produit par **Copilot CLI** (`claude-sonnet-5.5`) ; **les 9 mesures critiques revérifiées
indépendamment par Gérard**. Corrections écrites par Copilot, données astronomiques fournies et
vérifiées par Gérard.

## Défauts constatés et corrigés

| # | Défaut | Portée | Correction |
|---|---|---|---|
| 1 | Schéma d'objet appauvri : 5 clés au lieu de 8 (`code`, `instrument`, `src` absents) | 82 objets (12 fiches) | **264/264 objets à 8 clés** |
| 2 | `nature` = « objet » (générique) | 81 objets | Nature réelle depuis NGC 2000.0 (amas, galaxie, nébuleuse…) |
| 3 | `note` en notation catalogue brute (« !!!, vB, vL, pL, cE », « = M27 ») | 51 notes | Réécrites en français, **sourcées sur les fiches Atlas** |
| 4 | `role` gabarit « Étoile de la figure (mag 3.1356). » — répète la magnitude, 4 décimales | 12 fiches | Vidé des gabarits ; contenu à fournir |
| 5 | `visibilite` en 5 formulations | 453 étoiles | Normalisée : `œil nu` (452), `jumelles` (1) |
| 6 | `instrument` = placeholder « instrument » | 35 objets | `n. d.` + légende `INSTR` dans `referentiel_sources` |
| 7 | Code `N1` utilisé sans légende | 64 objets | Code `N2` légendé + `src` renseigné |
| 8 | Légende `n. d.` absente | 26 fiches | Ligne `INSTR` ajoutée |

## Décisions de fond (Gérard)
- **`instrument`** : l'Atlas n'indique l'instrument que pour une minorité d'objets.
  Aucune valeur inventée → **`n. d.`** (120 objets), légendé dans la fiche.
- **Notes** : reconstruction **manuelle**, objet par objet. Les extractions automatiques
  confondaient les objets cités en énumération (ex. « M 59 » recevait la phrase de M 60).
  Trois fausses corrections interceptées avant écriture : NGC 6826 (mention Hubble ≠ observation),
  NGC 6960/6979/6992 (conditionnel « semble-t-il »), NGC 7635 confondu avec IC 59.

## État final mesuré
- 49 fiches · 21/21 clés racine · **264/264 objets à 8 clés** · 264/264 avec `src`
- 453 étoiles · 0 gabarit `role` · 0 `nature` générique · 0 note en notation brute
- Index à 49 · 49 figures SVG · 0 doublon
- Test navigateur : **écran 5 conforme**, 0 erreur, débordement de badge corrigé (vérif. visuelle)

## Régression évitée
Écrire `instrument non déterminé` en clair provoquait un **débordement du badge** sur la colonne
OBJET (`.instr { white-space: nowrap }`) → détecté par contrôle visuel avant publication.
Valeur raccourcie en `n. d.`.

## Sources
Étoiles : Hipparcos (I/311) · Désignations : IV/27A (Kostjuk) · Objets : NGC 2000.0 (VII/118) ·
Tracés : constellation_lines_iau.dat (In-The-Sky.org) · Descriptions : fiches Atlas d'observation (OCA).
