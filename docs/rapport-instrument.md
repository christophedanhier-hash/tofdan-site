# Rapport — renseignement de l'instrument (96 objets)

Table appliquée : `/tmp/table-instrument.json` (120 lignes). Appariement par `id`. Rien n'est committé.

## Résultat
- **96 objets modifiés** dans 21 fichiers (`git diff` : 96 lignes `+` / 96 lignes `-`, uniquement `"instrument"`).
- **Aucun `id` introuvable** (96/96 appariés).
- Répartition appliquée : `œil nu` 18, `jumelles` 56, `télescope` 22 ; `n. d.` conservés : 24.
- Vérification programmatique : les 120 lignes de la table correspondent aux fichiers (0 écart).
- Total des 264 objets après lot : `jumelles` 104, `télescope` 71, `œil nu` 40, `lunette` 25, `n. d.` 24.

## Objets modifiés par fichier
aigle 2 · bouvier 2 · cephee 6 · couronne-boreale 1 · cygne 5 · dauphin 2 · dragon 1 · ecu-de-sobieski 5 · fleche 1 · lion 7 · petit-renard 5 · poissons 2 · poupe 3 · sagittaire 18 · scorpion 7 · serpent 2 · sextant 2 · taureau 5 · triangle 2 · verseau 3 · vierge 15

## Les 24 objets laissés en `n. d.` (inchangés)
- IC 59 — Cassiopée
- NGC 281 — Cassiopée
- IC 1590 — Cassiopée
- NGC 7762 — Céphée
- NGC 7822 — Céphée
- Barnard 150 — Céphée
- IC 1396 — Céphée
- NGC 7000 — Cygne
- IC 5070 — Cygne
- NGC 6914 — Cygne
- NGC 6960 — Cygne
- NGC 6979 — Cygne
- NGC 6992 — Cygne
- NGC 2363 — Grand Chien
- NGC 2359 — Grand Chien
- IC 2163 — Grand Chien
- NGC 2261 — Licorne
- NGC 1977 — Orion
- NGC 1490 — Persée
- NGC 1499 — Persée
- NGC 1579 — Persée
- M 24 — Sagittaire
- M 25 — Sagittaire
- NGC 604 — Triangle

## Anomalies / remarques
- Les 24 objets ont bien `mag: null` dans les fiches, cohérent avec le brief.
- Valeurs `instrument` préexistantes autres que `n. d.` : `lunette` (25) en plus de `œil nu`/`jumelles`/`télescope` ; non touchées.
- Modification faite par script (remplacement ligne à ligne de la seule ligne `"instrument": "n. d."` suivant l'`id` visé) ; fins de ligne et ordre des clés préservés.
- `docs/table-instrument.json` est un fichier non suivi préexistant, non modifié.
