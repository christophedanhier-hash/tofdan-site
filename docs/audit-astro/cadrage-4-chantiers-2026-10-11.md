# 🏗️ Cadrage des 4 chantiers — site tofdan.be

**Décision Christophe 11/10/2026** : « les 4 point sont nécessaire pour améliorer le site »
**Méthode** : Gérard cadre et vérifie · Copilot (`claude-sonnet-5.5`) développe · revue sur diff réel
**Base** : audit croisé Gérard × Agy (`docs/audit-astro/audit-croise-gerard-agy-2026-10-11.md`)

---

## Vue d'ensemble

| # | Chantier | Fichiers | Risque | Dépendance |
|---|---|---|---|---|
| ① | Photos à la surface | `index.html`, `news.html`, `css/style.css` | 🟡 moyen | assets déjà en ligne |
| ② | Contraste WCAG AA | `css/style.css` | 🟢 faible | aucun |
| ③ | Textures des planètes | `app/assets/textures/*`, `app/Simulateur_*.html` | 🟠 **élevé** | **13 assets téléchargés** |
| ④ | `index.html` : polices/favicon/thème | `index.html` | 🟢 faible | aucun |

**Ordre recommandé** : ④ → ② → ① → ③
**Raison** : on commence par le moins risqué pour valider la chaîne de délégation, et on
termine par ③ qui touche 3 fichiers de l'app et demande des assets binaires.
*(Révision possible : ① a le plus fort impact visiteur — Christophe peut le vouloir en premier.)*

---

## ④ `index.html` — polices, favicon, bouton de thème

### Constat mesuré
`index.html` est la **seule page du site** sans ces 3 éléments :

| Élément | `index.html` | `astro.html` (témoin) |
|---|---|---|
| `link rel="icon"` | **0** | 1 |
| `preconnect` fonts | **0** | 2 |
| `link fonts.googleapis` | **0** | 1 (`preload` + `stylesheet`) |
| `button#theme-toggle` | **0** | 1 |

### Conséquence
- La page d'accueil s'affiche avec une **police système de secours** — elle ne ressemble
  pas au reste du site (le CSS charge `Inter` / `Space Grotesk`, jamais téléchargées).
- **Pas de favicon** → onglet navigateur générique.
- **Pas de bouton jour/nuit** → or `js/main.js` l.89-117 gère le thème via `localStorage` ;
  le script s'exécute (chargé l.107) mais **aucun bouton ne permet de basculer**.

### Correctif
Copier depuis `astro.html` (l.8-14) exactement :
1. le `<link rel="icon" … data:image/svg+xml …>`
2. les 2 `<link rel="preconnect">`
3. le `<link rel="preload" as="style" …>` + le `<link rel="stylesheet" …>` des polices
4. ajouter `<button id="theme-toggle" class="theme-toggle" aria-label="Passer en mode nuit">☀️</button>`
   dans le header, **au même emplacement** que sur les 10 autres pages
5. **versionner `js/main.js`** : l.107 → `js/main.js?v=1790954759` (constat Agy 2.3)

### Interdits
- Ne PAS toucher `<header>`/`<footer>` en tant que tels (règle `ASTRO.md`) — mais le
  `theme-toggle` est **hors du bloc généré** (absent de `generate-nav.py`), donc
  l'ajout manuel est légitime ici. **À vérifier après coup** que `generate-nav.py --dry-run`
  ne le supprime pas.
- Ne PAS modifier `js/main.js`.

### Validation
- `curl -s https://tofdan.be/index.html | grep -c fonts.googleapis` → **≥ 2**
- `curl -s https://tofdan.be/index.html | grep -c 'rel="icon"'` → **1**
- `curl -s https://tofdan.be/index.html | grep -c 'theme-toggle'` → **1**
- Navigateur : la police de l'accueil = celle de `astro.html` (comparaison visuelle)
- Thème : clic → `data-theme` bascule, survit à un rechargement (`localStorage`)

---

## ② Contraste WCAG AA — `css/style.css`

### Constat mesuré (recalcul indépendant de Gérard, WCAG 2.1)

| Combinaison | Ratio | Seuil AA | Verdict |
|---|---|---|---|
| `--color-primary` `#4f46e5` sur `--color-bg` `#0a0a1a` | **3.12:1** | 4.5:1 | ⚠️ insuffisant |
| `--color-accent` `#7c3aed` sur `#0a0a1a` | **3.44:1** | 4.5:1 | ⚠️ insuffisant |
| `--color-primary` `#4f46e5` sur **carte** `#141432` | **2.84:1** | 4.5:1 | ❌ **échec** |
| `--color-text` `#e2e8f0` sur `#0a0a1a` | 15.90:1 | 4.5:1 | ✅ |
| `--color-text-muted` `#94a3b8` sur `#0a0a1a` | 7.65:1 | 4.5:1 | ✅ |

### Correctif
Éclaircir `--color-primary` et `--color-accent` **dans le thème sombre uniquement**
(`[data-theme="dark"]`), et **laisser le thème clair inchangé** (sur fond clair ces
couleurs ont un bien meilleur ratio).
Contrainte : **ratio ≥ 4.5:1** contre `#0a0a1a` **ET** contre `#141432`.

> Ordre de grandeur (à recalculer par Copilot, pas à copier aveuglément) :
> monter la luminosité d'environ 35-45 % — par ex. `#4f46e5` → `#8b87f0` ≈ 7:1 sur `#0a0a1a`.
> **Copilot doit calculer et donner les ratios obtenus.**

### Interdits
- Ne PAS changer les couleurs du thème clair.
- Ne PAS toucher aux autres variables.

### Validation
- Copilot **fournit le tableau des ratios** recalculés (avant/après) pour les 4 combinaisons.
- Gérard recalcule indépendamment et compare.
- Navigateur : aucune régression visuelle (le lien reste identifiable).

---

## ① Photos à la surface — `index.html`, `news.html`

### Constat mesuré
**Sur 13 pages, `album.html` est la seule à contenir des images.** Cinq emplacements sont
dimensionnés comme des photos et contiennent un **emoji** :

| Fichier | Ligne | Contenu actuel | Contexte |
|---|---|---|---|
| `index.html` | 49 | `🌌` (hero) | bandeau d'accueil |
| `index.html` | 82 | `🌕` | carte « En Vedette » |
| `index.html` | 89 | `☀️` | carte « En Vedette » |
| `news.html` | 74 | `🔭` | article |
| `news.html` | 104 | `🌌` | article |

La section « En Vedette » de l'accueil annonce : *« Quelques-unes de nos plus belles
captures récentes. »* → **et n'en montre aucune.**

### Correctif
Remplacer les emojis par de **vraies `<img>`** pointant vers des photos **déjà en ligne**
dans `images/album/`. **Copilot ne doit JAMAIS inventer de nom de fichier** : il lit
`album.html` (ou `ls images/album/`) et **réutilise des noms existants**.

- Conserver un `alt` descriptif (règle du site : 25/25 images en ont un).
- Ajouter `loading="lazy"` sauf si l'image est au-dessus de la ligne de flottaison.
- **Ne pas** ajouter de style inline → utiliser les classes existantes
  (`.featured-card__image` existe déjà).

### Interdits
- **Aucun nom de fichier inventé.** Si Copilot hésite entre deux photos, il s'arrête et demande.
- Ne PAS supprimer le titre/texte des cartes.

### Validation
- `curl -s https://tofdan.be/index.html | grep -c '<img'` → **≥ 3**
- Vérifier que **chaque** `src` retourne HTTP 200.
- Navigateur : la section « En Vedette » affiche de vraies photos.
- Aucune image cassée (icône navigateur).

---

## ③ Textures des planètes — `app/`

### Constat mesuré
- `app/assets/` **n'existe pas** ; `app/assets/textures/` non plus.
- `app/Simulateur_3D.html` l.146 : `const TEXTURE_PATH = './assets/textures/';`
- Références : `Simulateur_3D.html` (2), `Simulateur_Lune_3D.html` (3), `Simulateur_Terre.html` (4)
- **Preuve visuelle** : la Terre est une **sphère grise unie** (aucun continent, aucun océan).
- **Origine tranchée** : **jamais livrées** — 404 aussi sur l'ancien `github.io`, aucune
  trace dans l'historique git. **Ce n'est pas une régression du rapatriement.**
- **Silencieux** : `0` erreur JS en console (le code ne teste pas `response.ok`).

### Assets DÉJÀ PRÉPARÉS par Gérard (à installer tels quels)

Téléchargés, **vérifiés par `file`** (JPEG/PNG valides — pas du HTML), redimensionnés
**1024×512** (sauf anneau) :

| Fichier | Poids | Source / licence |
|---|---|---|
| `earth_day.jpg` | 70 922 o | Solar System Scope (libre) |
| `earth_night.jpg` | 32 626 o | idem |
| `earth_clouds.jpg` | 166 515 o | idem |
| `moon.jpg` | 150 993 o | idem |
| `mars.jpg` | 95 082 o | idem |
| `mercury.jpg` | 120 132 o | idem |
| `venus.jpg` | 116 445 o | idem |
| `jupiter.jpg` | 75 889 o | idem |
| `saturn.jpg` | 31 940 o | idem |
| `saturn_ring.jpg` | 36 073 o | idem (anneau) |
| **`earth_normal.jpg`** | 53 009 o | **three.js (mrdoob) — MIT** |
| **`earth_specular.jpg`** | 71 322 o | **three.js (mrdoob) — MIT** |
| **`earth_night.png`** | 352 011 o | **three.js (mrdoob) — MIT** |

**Total : 1 372 959 o (1,3 Mo)** — contre 5,9 Mo en 2K. Emplacement : `/home/tofdan/pi-labo/textures-planetes/`.

> ⚠️ **Leçon à retenir** : les 2 premiers essais sur `solarsystemscope.com` pour
> `earth_normal` / `earth_specular` ont renvoyé **du HTML** (page d'erreur) au lieu
> d'une image — **ces fichiers N'EXISTENT PAS** dans ce catalogue. Vérification `file`
> obligatoire après tout téléchargement.

**Noms attendus par le code — couverture vérifiée** :
`earth_day.jpg` ✅ · `earth_night.png` ✅ · `earth_normal.jpg` ✅ · `earth_specular.jpg` ✅ · `moon.jpg` ✅ · `mars.jpg` ✅

### Correctif
1. **Copier** les **13 fichiers** dans `app/assets/textures/` (créer l'arborescence).
2. **Adapter** `TEXTURE_MAP` et `loadTextureSafely` : les noms locaux prévus par le code
   (`earth_day.jpg`, `moon.jpg`, `mars.jpg`…) correspondent **déjà** aux fichiers fournis.
   → **Vérifier** le mapping ligne à ligne ; ne renommer les assets que si nécessaire.
3. **Ajouter une gestion d'erreur** : `loadTextureSafely` doit signaler un échec
   (aujourd'hui silencieux) → `console.warn` + repli couleur explicite.
4. **Ajouter la mention de licence** des textures (Solar System Scope : CC BY 4.0 —
   vérifier et citer) dans un `app/assets/textures/README.md`.

### Interdits
- Ne PAS modifier la logique 3D / les scènes.
- Ne PAS toucher aux autres fichiers de `app/`.
- **Ne PAS télécharger d'autres textures** : Gérard a déjà fait le sourcing et la
  vérification. Copilot installe **exactement** ces 13 fichiers.

### Validation
- `ls app/assets/textures/` → **13 fichiers**
- `curl -sI https://tofdan.be/app/assets/textures/earth_day.jpg` → **200**, `image/jpeg`
- Navigateur `Simulateur_Terre.html` → **la Terre montre des continents** (preuve visuelle)
- `Simulateur_3D.html` → Jupiter/Saturne texturés
- Console → **0** erreur

---

## Protocole de délégation (rappel)

1. **Branche dédiée** par chantier (`git checkout -b chantier-N-xxx`)
2. Brief Copilot **par fichier**, avec « **modifie ces fichiers** » (pas « fournis-moi »)
3. `--log` **obligatoire**, modèle `claude-sonnet-5.5`, `--allow-all-tools`
4. Reprise par **UUID** (jamais par nom — piège n°6)
5. **Relire le diff réel** (`git diff`), ne jamais croire le compte-rendu de l'agent
6. **Vérifier en production** après déploiement
7. **Tracer** au registre + commit signé `Gerard Astro <gerard@tofdan.be>`

**Règle absolue** : Gérard ne code pas. Il cadre, relit, mesure, prouve, trace.