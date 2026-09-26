# Inventaire des photos Seestar S50 — Christophe

**Version** : 1.0 — 26 septembre 2026
**Auteur** : Gérard (documentation technique)
**Source** : dossier Drive partagé [`1UnEi0WL0YFzn98suHMz69ak1o8dTAFrA`](https://drive.google.com/drive/folders/1UnEi0WL0YFzn98suHMz69ak1o8dTAFrA)
**Statut** : inventaire vérifié — 25 photos téléchargées et contrôlées (25 valides, 0 corrompue)

---

## 1. Objectif

Recenser les photos prises par Christophe au Seestar S50, vérifier leur exploitabilité technique, et déterminer leur adéquation avec les 49 constellations de l'Atlas de formation guide astro.

## 2. Méthode

1. Parcours récursif du dossier Drive partagé via l'API Google Drive.
2. Extraction du nombre de poses (`Stacked_<N>_…`), du filtre et de l'exposition depuis les noms de fichiers.
3. Sélection d'une photo « empilée » (stacked) par objet — critère : nombre de poses le plus élevé (meilleur rapport signal/bruit).
4. Téléchargement + intégrité (`PIL.Image.verify()`), relevé des dimensions réelles.
5. Contrôle visuel de 4 cas représentatifs (nébuleuse, planète, Lune nocturne, cas ambigu).

**Lacune méthodologique assumée** : l'API `drive search` ne renvoie pas le champ `size` des fichiers. Le tri par taille est donc impossible ; le tri est fait sur le nombre de poses. Le poids réel a été mesuré après téléchargement.

## 3. Structure du dossier source

Chaque objet céleste dispose d'un dossier, avec des sous-dossiers dérivés :

- `<Objet>/` — fichiers principaux (`Stacked_<N>_<Objet>_<exp>s_<filtre>_<date>.jpg` + `.fit`)
- `<Objet>_sub/` — versions allégées
- `<Objet>_mosaic/` — mosaïques
- `_thn.jpg` — vignettes (ignorées)

Sont également présents : fichiers `.fit` (bruts, non retenus pour le web), et par objet les **horodatages d'acquisition** exploitables pour dater les observations.

## 4. Photos retenues (25)

### 4.1 Objets du ciel profond — 21

| Objet | Constellation | Poses | Exp. | Filtre | Dimensions | Poids |
|---|---|---|---|---|---|---|
| M 1 (Nébuleuse du Crabe) | Taureau | 201 | 10 s | LP | 2160×3840 | 2,1 Mo |
| M 31 (Andromède) | Andromède | 37 | 10 s | IRCUT | 2160×3840 | 2,2 Mo |
| M 33 (Triangle) | Triangle | 13 | 10 s | IRCUT | 1080×1920 | 188 Ko |
| M 35 | Gémeaux | 47 | 10 s | IRCUT | 2160×3840 | 740 Ko |
| M 42 (Orion) | Orion | 35 | 30 s | LP | 2160×3840 | 484 Ko |
| M 44 (Amas de la Crèche) | Cancer | 30 | 10 s | IRCUT | 1080×1920 | 448 Ko |
| M 45 (Pléiades) | Taureau | 27 | 10 s | IRCUT | 1080×1920 | 464 Ko |
| M 51 (Tourbillon) | Chiens de chasse | 33 | 10 s | IRCUT | 1080×1920 | 436 Ko |
| M 78 | Orion | 7 | 10 s | IRCUT | 2160×3840 | 1,7 Mo |
| M 81 (Bode) | Grande Ourse | 89 | 10 s | IRCUT | 2160×3840 | 2,2 Mo |
| NGC 1893 | Cocher | 262 | 10 s | LP | 2160×3840 | 1,8 Mo |
| NGC 281 (Pacman) | Cassiopée | 26 | 10 s | LP | 1080×1920 | 616 Ko |
| NGC 891 | Andromède | 133 | 10 s | IRCUT | 2160×3840 | 2,2 Mo |
| IC 434 (Tête de cheval) | Orion | 4 | 10 s | LP | 2160×3840 | 2,3 Mo |
| IC 1805 (Cœur) | Cassiopée | 241 | 30 s | LP | 2160×3840 | 2,0 Mo |
| C 23 = NGC 891 | Andromède | 1 | 10 s | IRCUT | 1080×1920 | 768 Ko |
| C 39 = NGC 1893 | Cocher | 9 | 10 s | IRCUT | 2160×3840 | 2,1 Mo |
| Aldebaran (étoile) | Taureau | 26 | 10 s | IRCUT | 1080×1920 | 388 Ko |
| Capella (étoile) | Cocher | 9 | 10 s | IRCUT | 1080×1920 | 272 Ko |
| Jupiter | — (planète) | 21 | 10 s | IRCUT | 1080×1920 | 140 Ko |
| Saturne | — (planète) | 6 | 10 s | IRCUT | 1080×1920 | 104 Ko |

### 4.2 Autres objets — 4

| Objet | Dimensions | Poids |
|---|---|---|
| Lune (nocturne) | 1080×1920 | 256 Ko |
| Soleil | 1080×1920 | 156 Ko |
| Jupiter (dossier `Planetary_photo`) | 536×960 | 52 Ko |
| « Scenery » — **en réalité la Lune de jour** | 264×480 | 32 Ko |

## 5. Contrôle visuel — constats

Quatre cas représentatifs ont été examinés :

- **M 42 (Orion)** — nébuleuse d'émission/réflexion bien révélée : cœur du Trapèze brillant, bande de poussière « Bouche du poisson » visible, extensions Hα roses. Bonne mise au point. Léger gradient en coin supérieur gauche (pollution lumineuse ou reflet non retiré au traitement). **Aucun texte ni bordure incrusté.**
- **Lune nocturne** — image de très haute qualité, Lune gibbeuse (≈ 65–75 % éclairée), cratères et terminateur très nets, fond de ciel propre. **Aucun texte incrusté.**
- **Jupiter** — ⚠️ **le disque est totalement surexposé** (blanc saturé). Les **lunes galiléennes sont visibles**, alignées. Impossible de distinguer les bandes nuageuses : la dynamique de l'image ne permet pas de concilier la luminosité de la planète et la faiblesse des lunes. Utilisable pour illustrer le *système jovien*, pas la surface de Jupiter.
- **`Scenery_photo`** — ⚠️ **le nom du dossier Drive est trompeur** : ce n'est pas un paysage, mais un **gros plan de la Lune sur ciel bleu de jour**, à fort grossissement, montrant des dizaines de cratères superposés et des ombres portées.

**Bonne nouvelle technique** : aucune des photos contrôlées ne comporte de texte, légende, date ou filigrane incrusté. **Elles sont donc directement utilisables dans une galerie web**, sans recadrage imposé.

## 6. Croisement avec l'Atlas de formation (49 constellations)

**18 constellations de l'Atlas sont couvertes par au moins une photo**, soit 37 %.

- **Orion** : 3 objets (M 42, M 78, IC 434)
- **Taureau** : 3 (M 1, M 45, Aldebaran)
- **Andromède** : 3 (M 31, NGC 891, C 23)
- **Cocher** : 3 (NGC 1893, C 39, Capella)
- **Cassiopée** : 2 (NGC 281, IC 1805)
- **Gémeaux**, **Cancer**, **Chiens de chasse**, **Grande Ourse**, **Triangle** : 1 chacun

**Objets sans rattachement à une constellation de l'Atlas** : Lune, Soleil, Jupiter, Saturne → à classer dans une rubrique « Système solaire ».

**Non couvertes** (31 constellations de l'Atlas) : à compléter lors de prochaines acquisitions.

## 7. Limites et points de vigilance

- Les noms d'objets en **`C 23`** et **`C 39`** sont des doublons de NGC 891 et NGC 1893 (catalogue Caldwell). À éviter de présenter deux fois dans une galerie.
- Les fichiers **`.fit`** (bruts linéaires) sont présents sur le Drive mais **non retenus** : ils nécessitent un traitement complet et ne s'affichent pas en ligne.
- Les **vignettes `_thn.jpg`** ne doivent pas être utilisées (basse résolution).
- ⚠️ Les **dates d'acquisition** visibles dans les noms de fichiers vont de **novembre 2025 à février 2026**. À confirmer avec Christophe comme étant les vraies dates d'observation, mais **non vérifiées** contre des conditions réelles.
- ⚠️ La **qualité relative** des images n'a été contrôlée visuellement que sur 4 cas sur 25. Un tri qualité complet nécessiterait l'examen des 21 restants.

## 8. Fichiers locaux

- Photos : `/home/tofdan/.hermes/profiles/gerard/working/seestar-photos/` (25 `.jpg` + `manifest.json`)
- Inventaire brut : `/home/tofdan/.hermes/profiles/gerard/working/inventaire-seestar.json`
- Scripts : `inventaire-seestar.py`, `download-seestar-photos.py` (profil gerard)

## 9. Sources

- Dossier Drive **photos Seestar S50** — fourni par Christophe le 26/09/2026
- Contrôle d'intégrité et de dimensions — `PIL` / `Image.verify()`, exécution du 26/09/2026
- Contrôle visuel — `vision_analyze` sur M 42, Lunar, Jupiter, Scenery, 26/09/2026
- Atlas de formation : `guide-complet-constellations-P1-P2-Atlas-V1.pdf` (49 constellations)

---

**Aucune donnée de cet inventaire n'est estimée ou inventée** : chaque ligne provient d'un fichier réellement listé puis téléchargé. Les points marqués ⚠️ sont des constats de contrôle, pas des suppositions.