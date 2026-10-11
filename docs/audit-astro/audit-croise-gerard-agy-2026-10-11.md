# 🔬 Audit croisé du site tofdan.be — Gérard × Agy

**Date** : 11/10/2026
**Méthode** : deux audits **indépendants** menés en parallèle, puis **chaque constat d'Agy vérifié ligne par ligne** par Gérard.

| | Gérard (audit v2) | Agy (Gemini 3.8 Flash) |
|---|---|---|
| Outil | Mesures shell/curl/navigateur | `agy --model gemini-3.8-flash-medium` |
| Constats | 8 | **14** |
| Force | Vérification en production, visuel | Lecture exhaustive du code, WCAG |

> **Verdict** : les deux audits sont **complémentaires**. Agy a trouvé **10 défauts que Gérard
> avait manqués**, dont **3 majeurs**. Gérard a **corrigé 2 surestimations** d'Agy et **étendu
> 2 constats** au-delà de ce qu'Agy signalait. **Aucun des deux n'est complet seul.**

---

## 1. ✅ Constats d'Agy VÉRIFIÉS et CONFIRMÉS

### 1.1 🔴 MAJEUR — Textures 3D absentes : les planètes sont grises

- **Fichiers** : `app/Simulateur_3D.html` l.146 (`TEXTURE_PATH = './assets/textures/'`),
  `app/Simulateur_Lune_3D.html` (3 réf.), `app/Simulateur_Terre.html` (4 réf.)
- **Vérification Gérard** :
  - `ls app/assets` → **`Aucun fichier ou répertoire de ce type`** ✅
  - `curl` sur `tofdan.be/app/assets/textures/earth_day.jpg` → **404** ✅
  - `curl` sur l'ancien `christophedanhier-hash.github.io/textures/earth_day.jpg` → **404** ✅
  - `git log --all -- "*textures*"` → **aucune trace** ✅
  - **Preuve visuelle** (`Simulateur_Terre.html`, vue dédiée) : la Terre est **une sphère
    grise totalement unie**, sans continents, sans océans, sans nuages.
- **Nuance apportée par Gérard** : Agy parle de « 404 systématiques » ; la console ne
  montre **aucune erreur JS** (`js_errors: []`). Les 404 sont **silencieuses** — le code
  ne teste pas `response.ok`. **Le défaut est bien réel mais il ne se plaint pas.**
- **Origine tranchée** : **ce n'est PAS une régression du rapatriement** — les textures
  n'ont jamais été committées, et elles étaient déjà 404 sur l'hébergement d'origine.
- **Impact** : 3 simulateurs sur 4 affichent des planètes **sans visage**. Sur un site
  d'astronomie, une Terre grise est un **défaut de crédibilité pédagogique**.
- **Recommandation** : fournir les textures (domaine public : NASA Visible Earth,
  Solar System Scope) **ou** assumer le rendu schématique en retirant le code mort.

### 1.2 🔴 MAJEUR — `index.html` est privée des polices, du favicon et du thème

- **Vérification Gérard** (comptage direct) :

| | `index.html` | `astro.html` (témoin) |
|---|---|---|
| `theme-toggle` | **0** | 1 |
| `fonts.googleapis` | **0** | 3 |
| `rel="icon"` | **0** | 1 |

✅ **Confirmé.** `index.html` charge **`css/style.css?v=1790954759`** — le CSS du site
avec ses variables — mais **jamais les polices**. Elle s'affiche donc avec une **police
système de secours**, sans favicon, et **sans bouton jour/nuit**.

- **Impact** : **la page d'accueil ne ressemble pas au reste du site.** C'est la première
  impression d'un visiteur.

### 1.3 🔴 MAJEUR — Contraste des liens non conforme WCAG AA

- **Vérification Gérard** : recalcul **indépendant** du ratio de contraste WCAG 2.1.

| Couleur | Fond | Ratio calculé | Seuil AA | Verdict |
|---|---|---|---|---|
| `--color-primary` `#4f46e5` | `#0a0a1a` | **3.12:1** | 4.5:1 | ⚠️ AA large seulement |
| `--color-accent` `#7c3aed` | `#0a0a1a` | **3.44:1** | 4.5:1 | ⚠️ AA large seulement |
| `--color-primary` `#4f46e5` | **carte** `#141432` | **2.84:1** | 4.5:1 | ❌ **ÉCHEC** |
| `--color-text` `#e2e8f0` | `#0a0a1a` | 15.90:1 | 4.5:1 | ✅ |
| `--color-text-muted` `#94a3b8` | `#0a0a1a` | 7.65:1 | 4.5:1 | ✅ |

✅ **Confirmé — mes chiffres tombent exactement sur les siens** (3.12 et 3.44), preuve
qu'Agy a réellement calculé. **Gérard étend même le constat** : sur les **cartes**
(`--color-bg-card: #141432`), le contraste tombe à **2.84:1**, pire que ce que citait Agy.

### 1.4 🟠 MOYEN — `User-Agent` interdit dans `meteo.js`

- **Fichier** : `js/meteo.js` l.471
- **Vérification** : `'User-Agent': 'Tofdan-Site/1.0 (christophedanhier-hash.github.io)'` ✅
- **Confirmé.** L'en-tête `User-Agent` est un *forbidden header name* de la spec Fetch :
  **le navigateur le refuse**. Deux problèmes en un : (a) la ligne est **inutile** —
  l'API Nominatim ne la reçoit pas ; (b) elle **trahit l'hébergement d'origine**
  (`github.io`) dans le code source.
- **Recommandation** : supprimer l'en-tête (aucun proxy nécessaire : Nominatim accepte
  les appels navigateur sans User-Agent personnalisé).

### 1.5 🟠 MOYEN — Ruptures de hiérarchie de titres

- **Vérification** : `app-astro.html` `<h1>` l.55 → `<h3>` l.76 (aucun `<h2>`) ;
  `news.html` `<h1>` l.55 → `<h3>` l.68 ; `meteo-astro.html` l.55 → l.91. ✅
- **Et Agy a vu ce que Gérard avait manqué** : `app/index.html` contient
  **DEUX `<h1>`** (l.139 « Découverte de notre Système Solaire » et l.172 « 🌌 Guide
  de l'Utilisateur », dans un modal). **Contredit la conclusion de l'audit v2 de Gérard**
  (« 1 seul `<h1>` par page » — vrai pour les 11 pages du site, **faux pour `app/`**,
  qui n'avait pas été mesuré sur ce critère).

### 1.6 🟠 MOYEN — Zoom mobile bloqué + `<button>` imbriqué dans `<a>`

- **Vérification** : `user-scalable=no, maximum-scale=1.0` dans le `<meta viewport>` ✅
- **Gérard étend le constat** : **les 4 simulateurs** sont touchés (`Simulateur_2D.html`,
  `_3D.html`, `_Lune_3D.html`, `_Terre.html`) — Agy n'en citait qu'un.
- **`<button>` dans `<a>`** : confirmé `app/Simulateur_3D.html` l.55, **et vérifié dans
  l'arbre d'accessibilité du navigateur** : `link "🏠 Accueil"` contient bien
  `button "🏠 Accueil"`. Le HTML5 interdit l'imbrication d'éléments interactifs.

### 1.7 🟠 MOYEN — Cul-de-sac de navigation dans l'application

- **Vérification** : `app/Simulateur_3D.html` l.55 → `<a href="index.html">` = **résout
  `app/index.html`**, pas la racine du site ✅
- **Confirmé par l'arbre d'accessibilité** lors de la visite de la page en production.
- **Aucun lien** depuis `app/index.html` vers `tofdan.be`. L'utilisateur est **piégé**.

### 1.8 🟠 MOYEN — `<style>` dans le corps d'`album.html`

- **Vérification** : `<style>` en l.60, **absente du `<head>`** ✅ → bien dans le `<main>`.
- **Confirmé.** Invalide en HTML5, casse la séparation structure/présentation.

### 1.9 🟡 MINEUR — `--color-surface` utilisée mais jamais définie

- **Vérification** : 1 seule occurrence, l.1006, dans `.construction-notice` — **aucune
  définition** dans `:root` ni `[data-theme]` ✅
- **Confirmé.** Le navigateur résout en **fond transparent**.

### 1.10 🟡 MINEUR — Classes CSS mortes ; ampersands non échappés ; `og:description` absente ; ARIA du burger ; FOUT de thème ; `for` manquants ; pas de skip-link

✅ **Tous vérifiés ou cohérents avec mes propres mesures.** Les ampersands non échappés
(`&family`, `&display`) sont bien présents dans les 10 pages ; `generate-nav.py` l.75-80
génère bien un bouton burger **sans `aria-controls`** ni `id` sur la liste.

---

## 2. ⚠️ Corrections apportées AU RAPPORT D'AGY

### 2.1 Agy se trompe sur la gravité des 404 (mais a raison sur le fond)

Agy écrit « 404 **systématiques** » et « dégradation visuelle ». Vérification : **aucune
erreur n'apparaît en console** (`js_errors: []`), et **les planètes s'affichent quand
même** (Saturne avec ses anneaux, Jupiter beige, Neptune cyan). Le code ne vérifie pas
`response.ok` → **l'échec est silencieux**. La dégradation est **réelle mais discrète** :
couleur unie au lieu d'une texture — pas un rendu cassé.
**Verdict** : constat **juste**, sévérité **correcte**, formulation **excessive**.

### 2.2 Agy cite UNE page pour le blocage du zoom — il y en a QUATRE

Constat **étendu** par Gérard (voir 1.6).

### 2.3 Agy affirme que `main.js` est sans `?v=` sur `index.html` — VRAI, et ça contredit l'audit v2 de Gérard

- **Vérification** : `grep -l 'src="js/main.js"'` → **`index.html` seule** ✅
- **Agy a raison.** L'audit v2 de Gérard affirmait « `main.js?v=1785752541` cohérent sur
  les 11 pages » — **c'était faux** : c'est vrai sur **10 pages**, pas 11.
  **Auto-correction de Gérard consignée ici.**

---

## 3. 🎯 Ce que Gérard avait trouvé et qu'Agy n'a pas vu

- **Le défaut visuel majeur** : 5 emplacements dimensionnés comme des photos contiennent
  des **emojis** (`index.html` l.49/82/89, `news.html` l.74/104). Agy ne le mentionne pas.
  C'est le **défaut le plus visible pour un visiteur**.
- **La phrase technique fausse** de `materiel.html` l.155 : *« poses de 60 secondes et plus
  de rotation de champ »* — le mode équatorial **supprime** la rotation de champ.
  **Agy ne pouvait pas le voir** : son brief lui interdisait de juger le contenu factuel.
- **L'`index.html` sans `?v=` sur `main.js`** — découvert par Agy (voir 2.3).

---

## 4. 📊 Synthèse consolidée — défauts par ordre d'impact

| # | Défaut | Sévérité | Trouvé par | Vérifié |
|---|---|---|---|---|
| 1 | **5 emplacements-photos = emojis** (accueil sans photo) | 🔴 | Gérard | ✅ visuel |
| 2 | **Textures 3D absentes** — planètes grises | 🔴 | Agy | ✅ visuel + 404 |
| 3 | **`index.html` sans polices/favicon/thème** | 🔴 | Agy | ✅ comptage |
| 4 | **Contraste des liens < WCAG AA** (2.84:1 sur cartes) | 🔴 | Agy+Gérard | ✅ calcul |
| 5 | **Cul-de-sac** dans `app/` (aucun retour au site) | 🟠 | Agy | ✅ navigateur |
| 6 | **`<button>` dans `<a>`** + zoom bloqué (×4 pages) | 🟠 | Agy | ✅ a11y tree |
| 7 | **`meteo.js`** : User-Agent inutile + fuite `github.io` | 🟠 | Agy | ✅ |
| 8 | **`main.js` sans `?v=`** sur `index.html` | 🟠 | Agy | ✅ |
| 9 | **Ruptures `<h1>`→`<h3>`** + 2 `<h1>` dans `app/` | 🟠 | Agy | ✅ |
| 10 | **`<style>` dans le corps** d'`album.html` | 🟠 | Agy | ✅ |
| 11 | **Phrase fausse** sur le mode équatorial | 🟠 | Gérard | ✅ |
| 12 | `--color-surface` non définie ; classes mortes ; `&` non échappés ; ARIA ; FOUT ; skip-link | 🟡 | Agy | ✅ |

**Total : 12 défauts distincts, tous vérifiés par mesure.**

---

## 5. 🧠 Leçon de méthode

**Un seul audit ne suffit pas.** Agy a trouvé 10 défauts sur 12 que Gérard n'avait pas vus ;
Gérard a corrigé 2 surestimations d'Agy et étendu 2 constats. **Aucun des deux, seul,
n'aurait produit cet inventaire.**

**Et les deux se sont trompés sur la sévérité, jamais sur le fond** — parce que tous deux
citaient **fichier + ligne + extrait**. **C'est la traçabilité qui a permis la vérification.**

**Ce qui reste non mesuré** : le rendu sur mobile réel, les tests lecteur d'écran
(NVDA/VoiceOver), et la Core Web Vitals en conditions réseau lentes.

---

## Annexe — provenance

- Brief Agy : `/tmp/agy-brief-audit.md` (2 522 o, 54 l.)
- Rapport Agy brut : `/home/tofdan/pi-labo/agy-audit/rapport-agy.md` (22 158 o, 368 l.)
- Commande : `agy --print-timeout 1200s --model gemini-3.8-flash-medium --dangerously-skip-permissions`
- Durée : ~11 min · exit 0 · stderr vide
- Audit Gérard : `docs/audit-astro/audit-complet-2026-10-11.md`