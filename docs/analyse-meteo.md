# Audit complet — Application Tofdan

## 1. Vue d'ensemble

### 1.1 Identité du projet

| Propriété | Valeur |
|---|---|
| **Nom** | Tofdan — Site d'Astrophotographie |
| **Domaine** | www.tofdan.be |
| **Propriétaires** | Tof & Syl |
| **Développeur** | Christophe |
| **Serveur** | LEO (Nginx, `/var/www/tofdan.be/`) |
| **GitHub** | `christophedanhier-hash/tofdan-site` (branche `main`) |
| **Date de création** | Juin 2026 |
| **État** | En construction |
| **Version** | 4 commits (Init projet → Iteration 2 → Bandeau → maj readme) |

### 1.2 Statistiques

| Fichier | Lignes | Type |
|---|---|---|
| `css/style.css` | 1344 | Styles |
| `js/meteo.js` | 323 | Script météo |
| `js/main.js` | 99 | Script principal |
| `materiel.html` | 191 | Page |
| `biblio.html` | 182 | Page |
| `meteo-astro.html` | 175 | Page |
| `album.html` | 158 | Page |
| `news.html` | 125 | Page |
| `chat.html` | 113 | Page |
| `index.html` | 112 | Page |
| `app-astro.html` | 111 | Page |
| `astro.html` | 100 | Page |
| **Total** | **3033** | |

---

## 2. Architecture technique

### 2.1 Stack

```
┌──────────────────────────────────────────────────┐
│  Site 100% statique — zéro build, zéro dépendance │
├──────────────────────────────────────────────────┤
│  HTML5    → 10 pages (.html)                     │
│  CSS3     → 1 feuille (style.css, 1344 lignes)    │
│  JS       → 2 scripts (main.js + meteo.js)        │
│  Fonts    → Google Fonts (Inter + Space Grotesk)  │
│  Serveur  → Nginx                                 │
│  APIs     → Open-Meteo (météo)                    │
└──────────────────────────────────────────────────┘
```

### 2.2 Modèle de composants

Le site n'utilise ni framework ni templating. Chaque page duplique manuellement :

| Composant | Présent sur | Lignes par occurrence |
|---|---|---|
| `<header>` + `<nav>` (9 liens) | 10 pages | ~25 |
| `.construction-banner` | 9 pages (sauf index, placé après hero) | ~9 |
| `<footer>` | 10 pages | ~16 |
| `.back-to-top` | 10 pages | ~1 |
| `<script src="js/main.js">` | 10 pages | ~1 |

**Code dupliqué total** : ~52 lignes × 10 pages = ~520 lignes dupliquées, soit environ **25% du code HTML total**.

### 2.3 Arborescence

```
tofdan-site/
├── index.html               Accueil
├── astro.html               Passion astronomie
├── app-astro.html           Lien app externe
├── news.html                Actualités (4 articles)
├── materiel.html            Matériel (3×3 cartes)
├── album.html               Galerie (15 photos)
├── meteo-astro.html         Météo (8 indicateurs live)
├── biblio.html              Ressources (livres/logiciels/liens)
├── chat.html                Formulaire contact
├── css/
│   └── style.css            Styles (1344 lignes)
├── js/
│   ├── main.js              Navigation + formulaire (99 lignes)
│   └── meteo.js             Météo temps réel (323 lignes)
└── docs/
    └── analyse-meteo.md     Ce document
```

### 2.4 Design System

Thème spatial sombre défini par 18 variables CSS (`:root`) :

| Token | Valeur | Usage |
|---|---|---|
| `--color-bg` | `#0a0a1a` | Fond principal |
| `--color-bg-card` | `#141432` | Fond des cartes |
| `--color-primary` | `#4f46e5` | Accent principal |
| `--color-accent` | `#7c3aed` | Accent secondaire |
| `--color-text` | `#e2e8f0` | Texte principal |
| `--color-text-muted` | `#94a3b8` | Texte secondaire |
| `--gradient-primary` | `#4f46e5 → #7c3aed` | Dégradé titres |
| `--font-sans` | Inter | Corps |
| `--font-display` | Space Grotesk | Titres |
| `--shadow-glow` | `0 0 40px rgba(79,70,229,0.15)` | Survol cartes |
| `--max-width` | `1200px` | Largeur conteneur |

---

## 3. Audit page par page

### 3.1 index.html — Accueil (112 lignes)

**Rôle** : Page d'entrée, Hero banner, cartes Vedette (Lune, Soleil).

**Contenu** :
- Hero fullscreen avec fond étoilé CSS (26 étoiles en `radial-gradient`)
- Animation `float` sur l'icône télescope
- 2 boutons CTA : Album (primary) + Astro (outline)
- Section Welcome avec texte d'introduction
- 2 cartes Featured (Lune, Soleil) avec emojis placeholder

**Audit** :

| Point | État | Détail |
|---|---|---|
| Hero | ✅ | Design attractif, responsive |
| CTA | ✅ | Deux boutons distincts, bon contraste |
| SEO | ✅ | Meta description + title personnalisés |
| Placeholders | ⚠️ | Images remplacées par emojis 🌕 ☀️ |
| Construction banner | ✅ | Placé après le hero (pas en haut) |

### 3.2 astro.html — Passion (100 lignes)

**Rôle** : Présentation de la passion astronomie, signature.

**Contenu** :
- 5 paragraphes de texte (`prose`)
- Signature « Syl & Tof »
- Info-box avec coordonnées GPS (50°32' N, 4°36' E)
- Pas d'images, pas d'interactions

**Audit** :

| Point | État | Détail |
|---|---|---|
| Contenu | ✅ | Texte bien rédigé, narratif personnel |
| Coordonnées | ✅ | Affichées dans une info-box dédiée |
| SEO | ✅ | Meta description pertinente |
| Liens internes | ❌ | Aucun lien vers album, météo ou contact |
| Call-to-action | ❌ | Page sans CTA — le visiteur peut partir |

### 3.3 app-astro.html — Application externe (111 lignes)

**Rôle** : Vitrine pour l'application Astro hébergée sur GitHub Pages.

**Contenu** :
- Bouton principal « Lancer l'application »
- 3 cartes : Catalogue, Éphémérides, Simulateur
- Lien externe : `christophedanhier-hash.github.io/Projet-Astro/www/`

**Audit** :

| Point | État | Détail |
|---|---|---|
| CTA principal | ✅ | Bouton primary bien visible |
| Description | ✅ | 3 cartes informatives |
| Lien externe | ✅ | `rel="noopener noreferrer"` présent |
| Contenu | ⚠️ | Très léger — pourrait fusionner avec astro.html |

### 3.4 news.html — Actualités (125 lignes)

**Rôle** : Blog avec 4 articles d'exemple.

**Contenu** :
- 4 articles dans une grille responsive (1 ou 2 colonnes)
- Dates de juin 2026 à mars 2026 (⚠️ incohérence : mars < juin)
- Images placeholder (emojis : 🌌 ☄️ 🔭 🌑)
- Liens « Lire la suite » pointant vers `#`

**Audit** :

| Point | État | Détail |
|---|---|---|
| Structure | ✅ | `<article>` sémantique, dates bien formatées |
| Contenu | ⚠️ | 4 articles seulement, liens morts (`href="#"`) |
| Dates | ❌ | L'ordre des articles est croissant (mars → juin) alors que l'affichage est décroissant (juin → mars). Cohérent dans l'HTML mais les dates sont dans le futur (juin 2026) |
| Grille | ✅ | 1 colonne mobile, 2 colonnes desktop |

### 3.5 materiel.html — Matériel (191 lignes)

**Rôle** : Inventaire de l'équipement.

**Contenu** :
- 3 sections : Télescopes (3), Caméras (3), Oculaires (3)
- Chaque item = une carte avec titre, description et liste à puces
- Fiches techniques détaillées (diamètre, focale, capteur, etc.)

**Audit** :

| Point | État | Détail |
|---|---|---|
| Organisation | ✅ | Catégories claires, 3×3 cartes |
| Données | ✅ | Spécifications techniques précises |
| Cohérence | ⚠️ | Les oculaires n'ont pas d'icône contrairement aux télescopes et caméras |
| Grille | ✅ | 1 col mobile → 2 cols tablette → 3 cols desktop |

### 3.6 album.html — Galerie (158 lignes)

**Rôle** : Galerie photo avec 15 emplacements.

**Contenu** :
- 3 sections : Lune (6), Soleil (3), Ciel profond (6)
- Chaque item = `gallery__item` avec placeholder emoji + overlay au survol
- Overlay affiche le label technique au survol

**Audit** :

| Point | État | Détail |
|---|---|---|
| Structure | ✅ | Grille responsive 1→2→3 colonnes |
| Overlay | ✅ | Animation CSS propre au survol |
| Placeholders | ❌ | Toutes les images sont des emojis, pas de vraies photos |
| Ratio | ⚠️ | `aspect-ratio: 1` forcé, idéal pour Lune mais pas pour ciel profond (souvent rectangulaire) |
| Nombre | ⚠️ | Déséquilibré : 6 Lune, 3 Soleil, 6 ciel profond |

### 3.7 meteo-astro.html — Météo (175 lignes)

**Rôle** : Indicateurs météo en temps réel pour l'observation.

**Contenu** :
- 8 cartes avec données live (API Open-Meteo)
- Spinner de chargement + barre d'erreur
- Bouton refresh + timestamp
- Phase lunaire calculée côté client
- Liens Meteoblue + Clear Outside

**Audit** :

| Point | État | Détail |
|---|---|---|
| Données live | ✅ | 11 variables Open-Meteo, pas de clé API |
| UX | ✅ | Loading states, erreurs, refresh, timestamp |
| Algorithme | ✅ | Seeing calculé (Jet + nuages + humidité) |
| Lune | ✅ | Calcul algorithmique sans API |
| Liens externes | ✅ | Meteoblue + Clear Outside |

### 3.8 biblio.html — Ressources (182 lignes)

**Rôle** : Recommandations : livres, logiciels, liens.

**Contenu** :
- 3 sections : Livres (3), Logiciels (4), Liens utiles (3)
- Chaque item = icône + titre + méta + description + lien externe

**Audit** :

| Point | État | Détail |
|---|---|---|
| Qualité des liens | ✅ | Stellarium, Siril, N.I.N.A., SharpCap — références pertinentes |
| Liens externes | ✅ | `rel="noopener noreferrer"` systématique |
| Structure | ✅ | Cohérent avec le reste du site |
| Nombre | ⚠️ | Seulement 10 ressources — peut être étoffé |

### 3.9 chat.html — Contact (113 lignes)

**Rôle** : Formulaire de contact.

**Contenu** :
- 3 champs : Nom, Email, Message
- Validation JS (champs requis + regex email)
- Message de succès après soumission
- **Aucun envoi réel** (pas de backend)

**Audit** :

| Point | État | Détail |
|---|---|---|
| Validation | ✅ | HTML5 (`required`) + JS (regex email) |
| UX erreur | ✅ | Classe `.form__input--error` bien visible |
| UX succès | ✅ | Animation de confirmation |
| Backend | ❌ | Le formulaire ne transmet nulle part les données. Le `e.preventDefault()` empêche toute soumission et simule un succès. |
| Sécurité | ⚠️ | Pas de rate limiting, pas de honeypot, pas de CAPTCHA |

---

## 4. Audit CSS (style.css — 1344 lignes)

### 4.1 Structure

| Section | Lignes | Contenu |
|---|---|---|
| Reset + Design Tokens | 1–43 | `:root`, reset, body |
| Header & Navigation | 98–209 | Sticky header, nav desktop + mobile |
| Main Content | 211–276 | `.container`, `.section`, `.page-header` |
| Hero | 278–380 | Fond étoilé, animation float |
| Buttons | 382–436 | `.btn--primary`, `.btn--outline`, tailles |
| Construction Banner | 438–468 | Bandeau violet |
| Welcome | 470–485 | Texte centré |
| Featured | 487–538 | `.featured-card` (accueil) |
| Cards | 540–608 | `.card`, `.card-grid` (matériel, biblio) |
| Gallery | 610–672 | `.gallery`, `.gallery__item`, overlay |
| News | 674–740 | `.news-card` |
| Contact Form | 742–832 | `.form`, validation, succès |
| Weather | 834–908 | `.weather-card`, `.meteo-status`, `.meteo-controls` |
| Info Box | 910–922 | `.info-box` (coordonnées) |
| Signature | 924–929 | `.signature` |
| Prose | 931–958 | `.prose` (contenu texte) |
| Bibliography | 960–1009 | `.biblio-item` |
| Footer | 1011–1080 | `.footer` + social |
| Back to Top | 1082–1116 | `.back-to-top` |
| Responsive | 1118–1253 | 3 breakpoints (640, 1024, 767) |
| Utilities | 1255–1284 | `.text-center`, `.mt-*`, `.mb-*`, `.sr-only` |

### 4.2 Qualité

| Critère | Score | Détail |
|---|---|---|
| Design tokens | ✅ | 18 variables CSS bien nommées |
| BEM naming | ✅ | Cohérent : `.block__element--modifier` |
| Responsive | ✅ | 3 breakpoints ciblés, mobile-first |
| Animations | ✅ | `float`, `spin`, `pulse`, transitions fluides |
| Inline styles | ⚠️ | Quelques `style=""` dans le HTML (`padding-top: 0`, `margin-top: 48px`) |
| Duplication | ⚠️ | `.card`, `.weather-card`, `.news-card`, `.featured-card` partagent des styles similaires (fond, bordure, hover). Factorisable. |
| Dark mode | ❌ | Pas de `prefers-color-scheme` — le thème clair n'existe pas |

---

## 5. Audit JavaScript

### 5.1 main.js (99 lignes)

**Rôle** : Navigation mobile + lien actif + back-to-top + formulaire contact.

| Fonctionnalité | Implémentation | Qualité |
|---|---|---|
| Burger menu | Toggle `.nav--open`, ARIA `aria-expanded`, body scroll lock | ✅ |
| Lien actif | Comparaison `pathname` avec `href` | ✅ |
| Back-to-top | Scroll listener >400px, smooth scroll | ✅ |
| Formulaire contact | Validation nom/email/message, succès simulé | ⚠️ |
| Structure | IIFE `(function() { 'use strict'; })()` | ✅ |
| Compatibilité | ES5 (pas de `const`/`let`, pas de `=>`) | ✅ |

**Problèmes** :
- Le formulaire utilise `e.preventDefault()` et cache le form sans transmettre les données
- Pas de `passive: true` sur le scroll listener de back-to-top (corrigé : ligne 41 a `{ passive: true }`)
- La détection du lien actif a deux passes (lignes 19-32 et 88-98) — redondance partielle

### 5.2 meteo.js (323 lignes)

**Rôle** : Données météo live + phase lunaire.

Voir la section dédiée §7 pour l'analyse détaillée.

---

## 6. Points de vigilance

### 6.1 Structurels

| Problème | Impact | Priorité |
|---|---|---|
| **Duplication massive du code** | Maintenance : modifier header/footer nécessite 10 edits. Risque d'incohérence entre pages. | Haute |
| **Pas de `.gitignore`** | Risque de commiter des fichiers sensibles (.env, backups, etc.) | Haute |
| **Pas de favicon** | Onglet navigateur sans icône | Moyenne |
| **Pas de `robots.txt`** | SEO non contrôlé | Moyenne |
| **Pas de sitemap** | SEO — les moteurs doivent découvrir les pages par crawl | Basse |
| **Pas d'OpenGraph/Twitter Cards** | Partage sur réseaux sociaux sans image ni description riche | Basse |
| **Google Fonts bloquant** | `@import` dans CSS bloque le rendu tant que la fonte n'est pas chargée | Basse |

### 6.2 Fonctionnels

| Problème | Impact | Priorité |
|---|---|---|
| **Formulaire contact factice** | L'utilisateur croit avoir envoyé un message, rien n'est transmis | Haute |
| **Galerie sans photos** | 15 emplacements vides (emojis). Page inutile en l'état | Haute |
| **Featured cards sans liens** | Les cartes Lune/Soleil sur l'accueil ne sont pas cliquables | Moyenne |
| **Liens « Lire la suite » morts** | `href="#"` sur les 4 articles | Moyenne |
| **Liens footer morts** | Mentions légales et CGU → `href="#"` | Moyenne |
| **Pas de page 404** | Erreur navigateur par défaut si URL inexistante | Basse |

### 6.3 CSS

| Problème | Impact | Priorité |
|---|---|---|
| **Inline styles dans HTML** | `style="padding-top: 0"` et `style="margin-top: 48px"` dans 6 pages. Devrait être une classe utilitaire. | Moyenne |
| **Cartes non factorisées** | `.card`, `.weather-card`, `.news-card`, `.featured-card` ont ~60% de styles communs | Basse |
| **`aspect-ratio: 1` partout** | La galerie force un ratio carré même pour les photos rectangulaires | Basse |

### 6.4 JS

| Problème | Impact | Priorité |
|---|---|---|
| **Validation formulaire sans backend** | Message envoyé non traité | Haute |
| **Double détection lien actif** | `main.js:88-98` est un fallback redondant de la première passe `main.js:19-32` | Basse |

---

## 7. Module Météo — Analyse détaillée

### 7.1 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    meteo-astro.html                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ #meteo-loading│  │ #meteo-error │  │  8 weather-card │ │
│  │ (spinner)     │  │ (message)    │  │  avec IDs        │ │
│  └─────────────┘  └─────────────┘  └────────┬────────┘ │
│  ┌──────────────────────────────────────────┘          │
│  │ #meteo-refresh + #meteo-timestamp                   │
│  └────────────────────────────────────────────────────── │
│                                                          │
│  <script src="js/meteo.js"></script>                    │
└─────────────────────────────────────────────────────────┘
         │
         │ fetch()
         ▼
┌─────────────────────────────┐
│  api.open-meteo.com         │  ← HTTP GET, gratuit, pas de clé API
│  /v1/forecast               │
│                             │
│  hourly (11 variables) :    │
│    cloud_cover              │
│    cloud_cover_low/mid/high │
│    relative_humidity_2m     │
│    dew_point_2m             │
│    temperature_2m           │
│    wind_speed_10m           │
│    wind_gusts_10m           │
│    wind_speed_250hPa        │
│                             │
│  daily (2 variables) :      │
│    sunrise, sunset          │
└─────────────────────────────┘

  Phase lunaire → calculée localement
```

### 7.2 Sources de données

#### Open-Meteo

| Paramètre | Valeur |
|---|---|
| Endpoint | `https://api.open-meteo.com/v1/forecast` |
| Coordonnées | 50.5333°N, 4.6°E |
| Fuseau horaire | `Europe/Brussels` |
| Forecast | 24 heures |
| Licence | Gratuit, 10 000 req/jour (non commercial) |
| Authentification | Aucune |

#### URL construite

```
https://api.open-meteo.com/v1/forecast
  ?latitude=50.5333
  &longitude=4.6
  &hourly=cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,
           relative_humidity_2m,dew_point_2m,temperature_2m,
           wind_speed_10m,wind_gusts_10m,wind_speed_250hPa
  &daily=sunrise,sunset
  &timezone=Europe/Brussels
  &forecast_hours=24
```

#### Mapping variables → indicateurs

| Variable Open-Meteo | Unité | Carte HTML | ID |
|---|---|---|---|
| `cloud_cover` | % | Couverture nuageuse | `wc-cloud` |
| `cloud_cover_low/mid/high` | % | Détail nuages (bas/moyen/haut) | `wc-cloud` |
| — (calculé) | score /10 | Seeing | `wc-seeing` |
| `relative_humidity_2m` | % | Humidité | `wc-humidity` |
| `dew_point_2m` | °C | Point de rosée + alerte buée | `wc-humidity` |
| `temperature_2m` | °C | Température | `wc-temp` |
| `wind_speed_10m` | km/h | Vent | `wc-wind` |
| `wind_gusts_10m` | km/h | Rafales | `wc-wind` |
| `wind_speed_250hPa` | km/h | Jet Stream | `wc-jet` |
| — (calculé local) | phase | Phase lunaire | `wc-moon` |
| `sunrise` | ISO 8601 | Lever du Soleil | `wc-sun` |
| `sunset` | ISO 8601 | Coucher du Soleil | `wc-sun` |

### 7.3 Algorithme du Seeing

**Formule** :
```
seeing = (jetSpeed / 40) + (cloudCover / 100) + (humidity / 100)
```

- Jet Stream (coeff 1/40) : facteur dominant. Un jet fort dégrade le seeing.
- Nuages (coeff 1/100) : contribution modérée.
- Humidité (coeff 1/100) : contribution modérée.

**Échelle** :

| Score | Label | Couleur CSS | Conditions typiques |
|---|---|---|---|
| ≤ 2,5 | Excellent | `#22c55e` | Jet < 60 km/h, ciel dégagé, sec |
| ≤ 4,5 | Bon | `#84cc16` | Jet < 100 km/h, nuages épars |
| ≤ 6,5 | Moyen | `#eab308` | Jet < 140 km/h, partiellement couvert |
| ≤ 8,5 | Médiocre | `#f97316` | Jet fort ou très nuageux |
| > 8,5 | Mauvais | `#ef4444` | Jet très fort, couvert, humide |

**Exemple** : Jet 85 km/h, nuages 30%, humidité 60% → `(85/40)+(30/100)+(60/100)` = **3,0 (Bon)**.

### 7.4 Algorithme de la phase lunaire

**Principe** : calcul basé sur le jour julien et le cycle synodique lunaire (29,53058867 jours).

**Référence** : Nouvelle Lune du 6 janvier 2000 (JD 2451549,5).

**Étapes** :
1. Date → jour julien
2. Jours écoulés depuis la référence / 29,53058867
3. Partie fractionnaire = position dans le cycle (0 = Nouvelle Lune)
4. Illumination = `(1 − cos(phase × 2π)) / 2` (0–100%)
5. Âge = `phase × 29,53` jours

**Précision** : ± quelques heures, amplement suffisant pour l'usage.

### 7.5 Flux de données

```
1. DOM prêt
   │
2. init()
   ├── Cache les références DOM (8 cartes + 4 contrôles)
   ├── Bind click sur #meteo-refresh
   └── fetchWeatherData()
        │
3. showLoading()
   ├── Affiche spinner + pulse animation sur les cartes
   └── Désactive le bouton refresh
        │
4. fetch(api.open-meteo.com)
        │
   ┌────┴────┐
   ✅ succès  ❌ échec
   │          │
5. processOpenMeteo()    showError()
   │                        │
   ├── getCurrentHourIndex  ├── calcMoonPhase()
   ├── Extrait valeurs      │   (lune toujours calculée)
   ├── Calcule le seeing    └── Affiche erreur
   ├── updateCard() × 8
   ├── hideLoading()
   └── calcMoonPhase()
        │
6. hideLoading()
   ├── Masque spinner
   ├── Réactive bouton
   └── Affiche timestamp "Mis à jour le JJ/MM HH:MM"
```

### 7.6 Gestion des erreurs

| Scénario | Comportement |
|---|---|
| Réseau injoignable | Message « Impossible de récupérer les données météo. Vérifiez votre connexion internet. » |
| Erreur HTTP | Affichage du code d'erreur |
| API retourne `error: true` | Affichage du champ `reason` |
| Variable absente de la réponse | La carte conserve le placeholder `—` |
| `wind_speed_250hPa` absent | Fallback sur `wind_speed_200hPa`, sinon pas de Jet Stream |
| Échec API mais lune OK | La phase lunaire est toujours calculée et affichée (indépendante du réseau) |

### 7.7 Structure du code (meteo.js)

```
meteo.js (IIFE)
├── Configuration : LAT, LON, TIMEZONE
├── Références DOM : cards{}, refreshBtn, timestampEl, errorEl, loadingEl
├── Calculs
│   ├── calcMoonPhase(date)        → { name, illumination, age }
│   ├── seeingLabel(score)         → "Excellent" ... "Mauvais"
│   └── seeingColor(score)         → couleur CSS
├── Affichage
│   ├── moonEmoji/cloudEmoji/...   → icônes dynamiques
│   └── updateCard(id,val,detail)  → mise à jour DOM
├── État UI
│   ├── showLoading() / hideLoading()
│   └── showError(msg)
├── Traitement
│   ├── getCurrentHourIndex()      → index de l'heure actuelle
│   ├── processOpenMeteo(data)     → parse + update DOM
│   └── fetchWeatherData()         → fetch + then/catch
└── init()                         → point d'entrée
```

### 7.8 Performances

| Métrique | Valeur |
|---|---|
| Appels HTTP par chargement | 1 (Open-Meteo) |
| Taille réponse API | ~3–8 Ko |
| Temps de réponse API | ~100–300 ms (CDN) |
| Poids JS météo | ~8 Ko (non minifié) |
| Calcul lune | < 0,1 ms (synchrone) |
| Reflows DOM | Aucun forcé (modifications groupées) |

---

## 8. Extensibilité

### 8.1 Court terme

| Amélioration | Effort | Impact |
|---|---|---|
| Résoudre le formulaire de contact (backend PHP simple ou service tiers) | 2h | Critique |
| Ajouter un `.gitignore` | 5 min | Sécurité |
| Ajouter un favicon | 15 min | Image de marque |
| Remplir la galerie avec de vraies photos | Variable | Contenu |
| Rendre les featured cards cliquables | 5 min | UX |

### 8.2 Moyen terme

| Amélioration | Effort | Impact |
|---|---|---|
| Templating (SSI Nginx ou script build simple) pour éliminer la duplication | 3h | Maintenance |
| Ajouter WeatherAPI pour des éphémérides lunaires plus précises | 1h | Précision |
| Page 404 personnalisée | 30 min | UX |
| OpenGraph / Twitter Cards | 30 min | SEO Social |
| `robots.txt` + sitemap.xml | 30 min | SEO |

### 8.3 Long terme

| Amélioration | Effort | Impact |
|---|---|---|
| Dark mode toggle (si thème clair souhaité) | 2h | Accessibilité |
| Cache localStorage pour les données météo | 2h | Performance |
| Prévisions météo multi-jours (graphique/tableau) | 4h | Fonctionnalité |
| Base statique Bortle Scale pour pollution lumineuse | 3h | Fonctionnalité |
| Migration vers un générateur statique (11ty/Astro) | 8h | Architecture |

---

## 9. Plan d'action prioritaire

### 🔴 Bloquant

1. **Formulaire de contact** : implémenter un envoi réel (email, webhook, ou service tiers type Formspree)
2. **`.gitignore`** : créer le fichier avec `*.log`, `.env*`, `node_modules/`, `.DS_Store`, etc.

### 🟡 Important

3. **Galerie photos** : remplacer les emojis par de vraies images
4. **Liens morts** : remplacer `href="#"` (footer, news) par des pages réelles
5. **Favicon** : ajouter une icône
6. **Header/Footer dupliqués** : utiliser des Server-Side Includes (SSI) Nginx pour factoriser

### 🟢 Confort

7. **Featured cards cliquables** sur l'accueil
8. **SEO** : OpenGraph, sitemap, robots.txt
9. **Page 404**
10. **Inline styles** → classes CSS

---

## 10. Récapitulatif des fichiers

| Fichier | Lignes | État | Notes |
|---|---|---|---|
| `index.html` | 112 | ✅ | Accueil complet |
| `astro.html` | 100 | ✅ | Manque CTA |
| `app-astro.html` | 111 | ✅ | Page vitrine |
| `news.html` | 125 | ⚠️ | Liens morts |
| `materiel.html` | 191 | ✅ | Complet |
| `album.html` | 158 | ❌ | Placeholders |
| `meteo-astro.html` | 175 | ✅ | Live + lune |
| `biblio.html` | 182 | ✅ | Complet |
| `chat.html` | 113 | ⚠️ | Pas de backend |
| `css/style.css` | 1344 | ✅ | Design system cohérent |
| `js/main.js` | 99 | ✅ | Navigation + form |
| `js/meteo.js` | 323 | ✅ | Météo live |
| `README.md` | 120 | ✅ | Documentation |
| `docs/analyse-meteo.md` | — | ✅ | Ce document |

**Total** : 3033 lignes, 14 fichiers.
