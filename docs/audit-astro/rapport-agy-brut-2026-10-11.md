# RAPPORT D'AUDIT TECHNIQUE — SITE TOFDAN.BE (ZONE ASTRO)

**Date d'audit :** Octobre 2026  
**Auditeur :** Auditeur Technique Senior  
**Périmètre audité :** 
- Pages : `index.html`, `astro.html`, `app-astro.html`, `news.html`, `materiel.html`, `album.html`, `meteo-astro.html`, `biblio.html`, `chat.html`, `cgu.html`, `mentions-legales.html`
- Assets : `css/style.css`, `js/main.js`, `js/meteo.js`, `js/contact-chat.js`
- Dossier app/ : `app/index.html`, `app/Simulateur_3D.html`
- Outil : `tools/generate-nav.py`

---

## 1. CONSTATS D'AUDIT

### 🔴 [MAJEUR] Répertoire de textures inexistant générant des erreurs 404 systématiques
- **Fichier** : [app/Simulateur_3D.html](file:///home/tofdan/Projets_Dev/tofdan-site/app/Simulateur_3D.html#L146) (lignes 146, 298, 335)
- **Constat** : Le script WebGL tente de charger les textures planétaires depuis `./assets/textures/`. Ce dossier n'existe pas dans l'arborescence du projet.
- **Preuve** :
```javascript
const TEXTURE_PATH = './assets/textures/';
// Mapping entre les noms originaux (dans astro-logic.js) et nos fichiers locaux renommés
const TEXTURE_MAP = {
    'earth_atmos_2048.jpg': 'earth_day.jpg',
    'moon_1024.jpg': 'moon.jpg',
    'mars_1k_color.jpg': 'mars.jpg'
};
...
if (p.tex) loadTextureSafely(getLocalTexturePath(p.tex), material);
...
if (m.tex) loadTextureSafely(getLocalTexturePath(m.tex), mMat);
```
*(Vérification système : la commande `ls app/assets/` retourne `Aucun fichier ou répertoire de ce type`)*.
- **Impact** : Déclenchement d'erreurs HTTP 404 en chaîne dans la console du navigateur pour chaque astre texturé, dégradation visuelle de la simulation (rendu sans texture).
- **Recommandation** : Ajouter le dossier de textures attendu ou conditionner le chargement de textures à leur présence effective en appliquant un fallback matériel.

---

### 🔴 [MAJEUR] Incohérence structurelle sur `index.html` (absence de thème, polices et favicon)
- **Fichier** : [index.html](file:///home/tofdan/Projets_Dev/tofdan-site/index.html#L7-L14) (lignes 7-14 et 104-108)
- **Constat** : `index.html` est la seule des 11 pages du site à ne pas inclure le favicon, les balises de préchargement de Google Fonts, et le bouton de bascule jour/nuit (`#theme-toggle`).
- **Preuve** :
Dans [index.html](file:///home/tofdan/Projets_Dev/tofdan-site/index.html#L12-L14) :
```html
  <meta property="og:image" content="https://tofdan.be/og-image.jpg">
  <link rel="stylesheet" href="css/style.css?v=1790954759">
</head>
```
et lignes 105-107 :
```html
  <button class="back-to-top" aria-label="Retour en haut">↑</button>

  <script src="js/main.js"></script>
```
À titre de comparaison, [astro.html](file:///home/tofdan/Projets_Dev/tofdan-site/astro.html#L8-L12) contient :
```html
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,...">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap">
```
et ligne 100 :
```html
  <button id="theme-toggle" class="theme-toggle" aria-label="Passer en mode nuit">☀️</button>
```
- **Impact** : L'internaute arrivant sur la page d'accueil ne peut pas changer de thème. La typographie affichée est une fonte système de secours au lieu de la police du site, et l'onglet de navigation ne possède pas de favicon.
- **Recommandation** : Aligner l'en-tête `<head>` et les boutons péri-footer de `index.html` sur les 10 autres pages.

---

### 🔴 [MAJEUR] Contraste insuffisant en thème sombre sur les liens (Non-conformité WCAG 2.1 AA)
- **Fichier** : [css/style.css](file:///home/tofdan/Projets_Dev/tofdan-site/css/style.css#L11-L18) (lignes 11-18 et 136-144)
- **Constat** : Les variables `--color-primary: #4f46e5;` et `--color-accent: #7c3aed;` sont appliquées sur les balises `<a>` sur un fond sombre `--color-bg: #0a0a1a;`. Le ratio de contraste calculé est de **3.12:1** pour la couleur par défaut et de **3.44:1** pour l'état `:hover`, sous le seuil minimal légal de 4.5:1.
- **Preuve** :
```css
:root {
  --color-bg: #0a0a1a;
  ...
  --color-primary: #4f46e5;
  --color-accent: #7c3aed;
  ...
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--color-accent);
}
```
- **Impact** : Échec au critère de succès 1.4.3 (Contraste minimal) du standard WCAG 2.1 niveau AA. Les liens intégrés dans le corps de texte sont difficilement déchiffrables et non reconnaissables sans survol.
- **Recommandation** : Éclaircir `--color-primary` et `--color-accent` pour le thème sombre (ex. `#818cf8` atteignant un ratio supérieur à 7:1) ou rétablir le soulignement des liens textuels.

---

### 🟠 [MOYEN] En-tête HTTP interdit dans l'appel reverse geocode Nominatim
- **Fichier** : [js/meteo.js](file:///home/tofdan/Projets_Dev/tofdan-site/js/meteo.js#L469-L474) (lignes 469-474)
- **Constat** : Le script définit manuellement l'en-tête `User-Agent` dans une requête `fetch()` exécutée par le navigateur.
- **Preuve** :
```javascript
    fetch(url, {
      headers: {
        'User-Agent': 'Tofdan-Site/1.0 (christophedanhier-hash.github.io)'
      }
    })
```
- **Impact** : Selon la spécification standard WHATWG Fetch, `User-Agent` est un en-tête interdit (*forbidden header name*). Le navigateur ignore l'en-tête et émet un avertissement en console (`Refused to set unsafe header User-Agent`). L'API Nominatim peut rejeter ou brider ces appels anonymes côté client.
- **Recommandation** : Supprimer l'en-tête interdit côté client ou relayer la requête par un proxy serveur si un User-Agent spécifique est requis.

---

### 🟠 [MOYEN] Ruptures de hiérarchie de titres (H1 vers H3 sans H2 intermédiaire)
- **Fichier** : [app-astro.html](file:///home/tofdan/Projets_Dev/tofdan-site/app-astro.html#L55) (lignes 55 et 76), [news.html](file:///home/tofdan/Projets_Dev/tofdan-site/news.html#L55) (lignes 55 et 68), [meteo-astro.html](file:///home/tofdan/Projets_Dev/tofdan-site/meteo-astro.html#L55) (lignes 55 et 91), [app/index.html](file:///home/tofdan/Projets_Dev/tofdan-site/app/index.html#L139) (lignes 139, 156, 172)
- **Constat** : Plusieurs pages sautent directement du niveau `<h1>` au niveau `<h3>` sans aucun `<h2>` intermédiaire. De plus, `app/index.html` contient deux balises `<h1>`.
- **Preuve** :
Dans [app-astro.html](file:///home/tofdan/Projets_Dev/tofdan-site/app-astro.html#L55) :
```html
55: <h1 class="page-header__title">Application Astro</h1>
...
76: <h3 class="card__title">Catalogue d'objets</h3>
```
Dans [news.html](file:///home/tofdan/Projets_Dev/tofdan-site/news.html#L55) :
```html
55: <h1 class="page-header__title">Actualités</h1>
...
68: <h3 class="news-card__title">Le Seestar S50 passe en mode équatorial</h3>
```
Dans [app/index.html](file:///home/tofdan/Projets_Dev/tofdan-site/app/index.html#L139) :
```html
139: <h1>Découverte de notre Système Solaire</h1>
...
156: <h3 style="color: #79c2ea; margin-bottom: 20px; font-size: 1.2rem;">Notre situation dans la Voie Lactée</h3>
...
172: <h1 style="color: #4da8da; text-align: center;">🌌 Guide de l'Utilisateur</h1>
```
- **Impact** : Dégradation de l'arbre d'accessibilité (WCAG 1.3.1) et pénalisation SEO pour la structure sémantique des documents.
- **Recommandation** : Insérer des sections intermédiaires de niveau `<h2>` ou transformer les `<h3>` en `<h2>`. Dans `app/index.html`, rétrograder le titre du modal en `<h2>`.

---

### 🟠 [MOYEN] Désactivation du zoom utilisateur et balisage interactif invalide dans Simulateur 3D
- **Fichier** : [app/Simulateur_3D.html](file:///home/tofdan/Projets_Dev/tofdan-site/app/Simulateur_3D.html#L5) (lignes 5 et 55)
- **Constat** : La balise méta viewport interdit le zoom (`user-scalable=no, maximum-scale=1.0`). De plus, un élément `<button>` est imbriqué dans une balise `<a>`.
- **Preuve** :
Ligne 5 :
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```
Ligne 55 :
```html
<a href="index.html" style="text-decoration:none;"><button id="home-btn" style="background:#3a4a5a; color:#fff; margin-top:10px; width:100%">🏠 Accueil</button></a>
```
- **Impact** : Blocage du zoom (échec WCAG 1.4.4 Redimensionnement du texte). L'imbrication d'éléments interactifs est invalide en HTML5 et génère des comportements imprévisibles au clavier et avec les lecteurs d'écran.
- **Recommandation** : Utiliser `<meta name="viewport" content="width=device-width, initial-scale=1.0">` et styliser directement le lien `<a>` en bouton sans y imbriquer `<button>`.

---

### 🟠 [MOYEN] Rupture ergonomique et absence de lien de retour depuis `app/index.html`
- **Fichier** : [app/index.html](file:///home/tofdan/Projets_Dev/tofdan-site/app/index.html#L143-L149) (lignes 143-149) et [app/Simulateur_3D.html](file:///home/tofdan/Projets_Dev/tofdan-site/app/Simulateur_3D.html#L55) (ligne 55)
- **Constat** : `app-astro.html` redirige l'utilisateur vers `app/index.html`. Une fois dans cette section, il n'existe aucun lien vers le site principal. Le lien « Accueil » de `app/Simulateur_3D.html` pointe vers `index.html` (qui résout `app/index.html`), piégeant l'utilisateur dans l'application.
- **Preuve** :
Dans [app/index.html](file:///home/tofdan/Projets_Dev/tofdan-site/app/index.html#L143-L149) :
```html
    <nav>
        <a href="Simulateur_2D.html" class="bouton-astro">🔭 Explorer le Système Solaire en 2D</a>
        <a href="Simulateur_3D.html" class="bouton-astro">🌌 Explorer le Système Solaire en 3D</a>
        <a href="Simulateur_Lune_3D.html" class="bouton-astro">🌑 Explorer la Lune</a>
        <a href="Simulateur_Terre.html" class="bouton-astro">🌍 Terre & Saisons</a>
        <button id="open-guide" class="bouton-astro" style="background-color: #3a4a5a; border-color: #3a4a5a; color: white;">📖 Guide d'utilisation</button>
    </nav>
```
- **Impact** : Cul-de-sac de navigation forçant l'utilisateur à se servir de l'historique du navigateur pour revenir au site tofdan.be.
- **Recommandation** : Ajouter un lien « ← Retour au site tofdan.be » (vers `../app-astro.html` ou `../index.html`) dans la barre de navigation de `app/index.html` et `app/Simulateur_3D.html`.

---

### 🟠 [MOYEN] Balise `<style>` non conforme dans le corps du document (`album.html`)
- **Fichier** : [album.html](file:///home/tofdan/Projets_Dev/tofdan-site/album.html#L60-L66) (lignes 60-66)
- **Constat** : Une balise `<style>` est insérée directement dans le flux du `<main>`, en violation des spécifications HTML5 standard.
- **Preuve** :
```html
    <style>
      .gallery__item img { width: 100%; height: 100%; object-fit: cover; }
      .gallery__item figcaption { margin: 0; }
      @media (max-width: 768px) {
        .gallery__overlay { opacity: 1; }
      }
    </style>
```
- **Impact** : Balisage HTML invalide signalé par HTML Tidy. Rupture de la séparation structure / présentation et dispersion des règles CSS hors de `style.css`.
- **Recommandation** : Transférer ces règles dans `css/style.css` et retirer la balise de `album.html`.

---

### 🟡 [MINEUR] Variable CSS non définie `--color-surface` dans `style.css`
- **Fichier** : [css/style.css](file:///home/tofdan/Projets_Dev/tofdan-site/css/style.css#L1003-L1009) (lignes 1003-1009)
- **Constat** : La classe `.construction-notice` consomme une variable `--color-surface` qui n'a jamais été déclarée dans `:root` ni dans `[data-theme="light"]`.
- **Preuve** :
```css
.construction-notice {
  text-align: center;
  padding: 48px 24px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}
```
- **Impact** : Propriété invalide résolue par le navigateur en fond transparent.
- **Recommandation** : Définir `--color-surface` (ex. aliasser sur `--color-bg-card`) ou purger la classe si elle est inutile.

---

### 🟡 [MINEUR] Classes CSS mortes et orphelines dans `style.css`
- **Fichier** : [css/style.css](file:///home/tofdan/Projets_Dev/tofdan-site/css/style.css#L211) (lignes 211, 220, 226, 427, 432, 1003-1030)
- **Constat** : Plusieurs règles et sélecteurs ne correspondent à aucun élément dans les 11 fichiers HTML ni dans les scripts JS (ex. `.header__logo-sub`, `.header__logo-text`, `.header__logo-title`, `.nav__link--danger`, `.nav__separateur`, `.construction-notice`, `.construction-banner`, `.sr-only`).
- **Preuve** :
Lignes 211-213 :
```css
.header__logo-text {
  display: flex;
  flex-direction: column;
}
```
Lignes 427-429 :
```css
.nav__link--danger {
  color: var(--color-error);
}
```
- **Impact** : Dette technique, augmentation du poids du fichier CSS (37 Ko) et risque de confusion lors des refontes.
- **Recommandation** : Purger les sélecteurs inutilisés pour alléger la feuille de style.

---

### 🟡 [MINEUR] Absence d'attributs ARIA pour l'état actif et la commande du menu
- **Fichier** : [tools/generate-nav.py](file:///home/tofdan/Projets_Dev/tofdan-site/tools/generate-nav.py#L75-L80) (lignes 75-80) et [js/main.js](file:///home/tofdan/Projets_Dev/tofdan-site/js/main.js#L21-L23) (lignes 21-23)
- **Constat** : Le bouton burger n'a pas d'attribut `aria-controls` ciblant la liste de navigation, qui ne possède pas d'identifiant `id`. De plus, aucun lien du menu ne reçoit l'attribut `aria-current="page"` (ni dans le HTML généré, ni dynamiquement dans `main.js`).
- **Preuve** :
Dans [tools/generate-nav.py](file:///home/tofdan/Projets_Dev/tofdan-site/tools/generate-nav.py#L75-L80) :
```html
        <button class="nav__toggle" aria-label="Menu" aria-expanded="false">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul class="nav__list">
```
Dans [js/main.js](file:///home/tofdan/Projets_Dev/tofdan-site/js/main.js#L21-L23) :
```javascript
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('nav__link--active');
    }
```
- **Impact** : Les lecteurs d'écran ne peuvent pas annoncer aux utilisateurs quelle page est activement consultée dans le menu, ni quel sous-menu est piloté par le bouton burger (WCAG 4.1.2).
- **Recommandation** : Attribuer un `id="main-nav-list"` à `<ul class="nav__list">`, référencer `aria-controls="main-nav-list"` sur le bouton, et ajouter `link.setAttribute('aria-current', 'page');` dans `main.js`.

---

### 🟡 [MINEUR] Caractères ampersand non échappés dans les URL de polices Google Fonts
- **Fichier** : 10 pages HTML (ex. [astro.html](file:///home/tofdan/Projets_Dev/tofdan-site/astro.html#L11-L12) lignes 11 et 12)
- **Constat** : Le symbole `&` séparant les paramètres de requête de l'URL Google Fonts n'est pas échappé en `&amp;`.
- **Preuve** :
```html
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap">
```
- **Impact** : Avertissement de syntaxe HTML signalé par le validateur W3C et HTML Tidy (`symbole & non échappé ou entité inconnue « &family »`).
- **Recommandation** : Remplacer `&family` et `&display` par `&amp;family` et `&amp;display` dans les balises `<link>`.

---

### 🟡 [MINEUR] Balises Open Graph incomplètes sur `cgu.html` et `mentions-legales.html`
- **Fichier** : [cgu.html](file:///home/tofdan/Projets_Dev/tofdan-site/cgu.html#L13-L16) (lignes 13-16) et [mentions-legales.html](file:///home/tofdan/Projets_Dev/tofdan-site/mentions-legales.html#L13-L16) (lignes 13-16)
- **Constat** : Contrairement aux 9 autres pages du site, la balise `<meta property="og:description">` est absente sur ces deux pages. De plus, aucune page du périmètre ne déclare de balise `<link rel="canonical">`.
- **Preuve** :
Dans [cgu.html](file:///home/tofdan/Projets_Dev/tofdan-site/cgu.html#L13-L16) :
```html
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://tofdan.be/cgu.html">
  <meta property="og:title" content="Conditions d'utilisation — Tofdan">
  <meta property="og:image" content="https://tofdan.be/og-image.jpg">
```
- **Impact** : Incohérence des métadonnées SEO lors du partage social et risque d'indexation incomplète.
- **Recommandation** : Insérer la balise `og:description` correspondante et ajouter des balises `<link rel="canonical" href="...">` canoniques.

---

### 🟡 [MINEUR] Incohérence de versionnement des assets (cache-busting)
- **Fichier** : [index.html](file:///home/tofdan/Projets_Dev/tofdan-site/index.html#L107) (ligne 107) et [meteo-astro.html](file:///home/tofdan/Projets_Dev/tofdan-site/meteo-astro.html#L188) (ligne 188)
- **Constat** : `index.html` appelle `js/main.js` sans paramètre de version (alors que les 10 autres pages appellent `js/main.js?v=1785752541`). De même, `meteo-astro.html` appelle `js/meteo.js` sans paramètre de version.
- **Preuve** :
Dans [index.html](file:///home/tofdan/Projets_Dev/tofdan-site/index.html#L107) :
```html
  <script src="js/main.js"></script>
```
Dans [meteo-astro.html](file:///home/tofdan/Projets_Dev/tofdan-site/meteo-astro.html#L188) :
```html
  <script src="js/meteo.js"></script>
```
- **Impact** : Comportement de mise en cache hétérogène en production, risquant de distribuer un script périmé aux utilisateurs.
- **Recommandation** : Harmoniser les paramètres de révision sur l'ensemble des scripts et feuilles de style.

---

### ℹ️ [INFO] Clignotement de thème au chargement (FOUT) dû au script de thème en pied de page
- **Fichier** : [js/main.js](file:///home/tofdan/Projets_Dev/tofdan-site/js/main.js#L88-L99) (lignes 88-99)
- **Constat** : L'initialisation du thème se produit dans `main.js`, chargé tout en bas du `<body>`.
- **Preuve** :
```javascript
  /* ===== Thème Jour/Nuit ===== */
  var THEME_KEY = 'tofdan-theme';
  var saved = localStorage.getItem(THEME_KEY);
  
  if (!saved) {
    // Défaut : jour
    document.documentElement.setAttribute('data-theme', 'light');
    updateToggleIcon('light');
  } else {
    document.documentElement.setAttribute('data-theme', saved);
    updateToggleIcon(saved);
  }
```
- **Impact** : Lors d'une navigation par un internaute ayant sélectionné le thème sombre, la page s'affiche brièvement avec le style clair par défaut avant que l'attribut `data-theme="dark"` ne s'applique (Flash of Unstyled Theme).
- **Recommandation** : Déplacer un micro-script inline dans le `<head>` pour appliquer immédiatement l'attribut `data-theme` avant le rendu initial du DOM.

---

### ℹ️ [INFO] Absence de liaisons explicites `for` sur les contrôles du Simulateur 3D
- **Fichier** : [app/Simulateur_3D.html](file:///home/tofdan/Projets_Dev/tofdan-site/app/Simulateur_3D.html#L22-L35) (lignes 22, 26, 33)
- **Constat** : Plusieurs balises `<label>` ne sont pas associées à leur champ de formulaire respectif via l'attribut `for`.
- **Preuve** :
Ligne 22 : `<label style="font-size: 0.9rem;">🎯 Chercher un astre :</label>` (contrôle : `<select id="target-select">`)  
Ligne 26 : `<label style="font-size: 0.9rem;">🗓️ Date : ...</label>` (contrôle : `<input id="date-input">`)  
Ligne 33 : `<label style="font-size: 0.9rem;">Vitesse : ...</label>` (contrôle : `<input id="speed-slider">`)
- **Impact** : Manque de confort d'usage (le clic sur le libellé ne donne pas le focus au champ) et perte de contexte pour les lecteurs d'écran.
- **Recommandation** : Renseigner les attributs `for="target-select"`, `for="date-input"` et `for="speed-slider"`.

---

### ℹ️ [INFO] Absence de lien d'évitement d'accès rapide au contenu
- **Fichier** : [index.html](file:///home/tofdan/Projets_Dev/tofdan-site/index.html#L17) et les 10 autres pages HTML (lignes 17-48)
- **Constat** : Aucune page ne dispose d'un lien d'évitement (*skip link*) pointant vers `<main>`.
- **Preuve** :
Dans les 11 pages, le premier élément focusable du DOM est le lien de logo `<a href="index.html" class="header__logo">`, suivi du bouton burger et des 10 liens du menu.
- **Impact** : Les personnes naviguant exclusivement au clavier doivent appuyer au minimum 12 fois sur la touche Tabulation sur chaque page avant d'atteindre le contenu principal.
- **Recommandation** : Ajouter un lien d'évitement en haut du `<body>` (`<a href="#main" class="skip-link sr-only">Aller au contenu principal</a>`) visible lors de la prise de focus.

---

## 2. CLASSEMENT DES 5 CORRECTIONS LES PLUS UTILES (PAR IMPACT)

1. **Rétablir l'arborescence de textures ou désactiver leur chargement dans le Simulateur 3D (`app/Simulateur_3D.html`)**  
   *Impact : Élimine les erreurs 404 systématiques en console et restaure la stabilité de rendu de l'application WebGL.*

2. **Harmoniser `index.html` avec les 10 autres pages (thème jour/nuit, polices Google Fonts, favicon)**  
   *Impact : Supprime la régression fonctionnelle et visuelle majeure sur la porte d'entrée principale du site.*

3. **Corriger les contrastes de couleurs en mode sombre dans `css/style.css` (`--color-primary` et `--color-accent`)**  
   *Impact : Met le site en conformité légale d'accessibilité WCAG 2.1 AA (critère 1.4.3) et rend les liens lisibles.*

4. **Supprimer le blocage de zoom mobile et les balises `<button>` imbriquées dans `app/Simulateur_3D.html`**  
   *Impact : Restaure l'accessibilité mobile (critère WCAG 1.4.4) et régularise la validité HTML5 des éléments interactifs.*

5. **Ajouter un lien de sortie / retour vers le site principal dans `app/index.html`**  
   *Impact : Supprime le cul-de-sac ergonomique et unifie le parcours utilisateur entre le site vitrine et ses applications interactives.*
