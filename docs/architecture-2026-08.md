# Architecture — Tofdan Site (août 2026)

**Date** : 03 août 2026 — Document produit après l'audit technique (`docs/audit-2026-08.md`) et les corrections R2-R5.  
**Auteur** : Copilot CLI (production) + Christophe (validation)  
**Périmètre** : www.tofdan.be — site statique 100% — deux volets (Astro public / Hermes privé)

---

## 1. Vue d'ensemble

### Diagramme ASCII — les deux volets

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          www.tofdan.be                                  │
│                                                                         │
│   ┌─────────────────────────────────────────┐                           │
│   │  VOLET ASTRO (public)                   │                           │
│   │                                         │                           │
│   │  index.html ──────────────────────────► │ Hub d'accueil (2 cartes) │
│   │  astro.html          news.html          │                           │
│   │  app-astro.html      materiel.html      │                           │
│   │  album.html          biblio.html        │                           │
│   │  meteo-astro.html    chat.html          │                           │
│   │  mentions-legales.html  cgu.html        │                           │
│   │                                         │                           │
│   │  Accessible à tous — Nginx : Allow /    │                           │
│   └─────────────────────────────────────────┘                           │
│                                                                         │
│   ┌─────────────────────────────────────────┐                           │
│   │  VOLET HERMES (privé)                   │                           │
│   │                                         │                           │
│   │  login.html ──► hermes.html ──► tuiles  │                           │
│   │  (auth client)   (hub LEO)      │       │                           │
│   │                                 ├──► /dashboard/  ┐                 │
│   │  Cookie hermes_auth             ├──► /docs/        │ Nginx          │
│   │  (Nginx = vrai rempart)         ├──► /bavi/        │ protect        │
│   │                                 └──► /voyages/    ┘                 │
│   └─────────────────────────────────────────┘                           │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  COUCHES TRANSVERSALES                                           │   │
│  │  css/style.css (33,7 Ko)  js/main.js (3,6 Ko)  js/meteo.js      │   │
│  │  Google Fonts CDN (Inter + Space Grotesk)                        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Serveur LEO — Nginx — /var/www/tofdan.be/ — clone git (branche main)  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Rôles et frontières

| Volet | Pages | Accès | Protection |
|---|---|---|---|
| **Astro** | 11 pages HTML + légales | Public | Nginx `Allow: /` |
| **Hermes** | `hermes.html`, `login.html` + routes serveur | Restreint | Cookie `hermes_auth` validé par Nginx |

---

## 2. Décisions d'architecture (ADR)

| ID | Décision | Justification | Alternatives écartées |
|---|---|---|---|
| **ADR-001** | **Site statique pur** — zéro build, zéro framework, zéro dépendance runtime | Maintenabilité maximale, déploiement trivial (`cp` + reload nginx), performances natives, pas de surface d'attaque applicative | Next.js, Nuxt, Hugo (surcharge de build et de déploiement disproportionnée pour 11 pages) |
| **ADR-002** | **HTML dupliqué par page** — header/nav (9 liens) et footer copiés dans les 11 fichiers | Cohérent avec ADR-001 : sans build, le templating n'est pas disponible ; accepté car le site est peu susceptible de croître massivement (issue M4 documentée) | SSI Nginx, PHP includes, templates Nunjucks, Eleventy |
| **ADR-003** | **CSS unique `style.css` avec custom properties + méthodologie BEM** | Design system léger (tokens via `:root`, composants nommés `.nav__link`, `.card__text`), un seul fichier à maintenir, lisibilité élevée | CSS-in-JS, Tailwind (build requis), CSS Modules (idem) |
| **ADR-004** | **JS vanilla ES5** (IIFE, pas de modules, pas de bundler) | Compatibilité navigateurs étendue, zéro transpilation, intégration directe dans la page sans `<script type="module">`, cohérent avec ADR-001 | TypeScript + Webpack/Vite (incompatibles ADR-001), ES Modules natifs (compatibilité réduite) |
| **ADR-005** | **Thème jour/nuit via attribut `data-theme` sur `<html>` + `localStorage`** | Solution CSS-native : deux jeux de custom properties (`:root` sombre par défaut, `[data-theme="light"]` clair), persistance locale, basculement instantané sans rechargement | Media query `prefers-color-scheme` seule (pas de bascule manuelle), cookies (inutilement complexe) |
| **ADR-006** | **Cache-busting manuel `?v=timestamp`** | Invalide le cache navigateur sans infrastructure (pas de hash de build) ; cohérent avec ADR-001 | Hash de contenu (nécessite un build), versioning sémantique (moins précis), headers `Cache-Control` nginx uniquement |
| **ADR-007** | **Google Fonts via `<link rel="stylesheet">` dans `<head>` + `preconnect` + `preload`** | Suppression de l'ancien `@import` render-blocking (correctif R5 du 03/08/2026) ; `preconnect fonts.googleapis.com` + `preload` accélèrent la résolution ; `display=swap` dans l'URL GFonts | Auto-hébergement des polices (maintenance supplémentaire), polices système seules (perte du design) |
| **ADR-008** | **Auth Hermes côté client dans `login.html`** — mot de passe `Leo2026` et cookie `hermes_auth` en JS | **Choix assumé par Christophe (03/08/2026)** : Nginx reste le vrai rempart via la validation du cookie sur les routes `/dashboard/`, `/docs/`, `/bavi/`, `/voyages/`. Le password JS est un second niveau volontaire, non critique, lisible dans la source | Auth serveur complète (effort backend disproportionné pour un usage personnel), suppression de la protection JS (régression UX) |
| **ADR-009** | **API Open-Meteo sans clé d'API** (gratuit, quota ~10 000 req/jour) | Zéro coût, zéro configuration serveur, accès immédiat aux données météo et de géocodage ; Nominatim/OSM pour le reverse geocoding | OpenWeatherMap (clé payante au-delà d'un quota), Météo-France (API non publique), implémentation serveur propre |
| **ADR-010** | **Déploiement via clone git dans `/var/www/tofdan.be/`** | Traçabilité (chaque état = commit), rollback trivial (`git checkout`), cohérence entre le dépôt et le serveur ; `sudo chown -R www-data:www-data` + `reload nginx` suffit | FTP (pas de traçabilité), pipeline CI/CD (surcharge pour un seul développeur), rsync (perte du lien git) |

---

## 3. Architecture des composants

### 3.1 Structure commune des pages

Toutes les pages HTML partagent la même structure (dupliquée — cf. ADR-002) :

```html
<html lang="fr" data-theme="light">          ← attribut thème
  <head>
    <!-- Meta SEO, Open Graph, favicon SVG inline, preconnect/preload GFonts -->
    <link rel="stylesheet" href="css/style.css?v=1785757465">
  </head>
  <body>
    <header class="header">                  ← sticky, backdrop-blur
      <nav class="nav" aria-label="Navigation principale">
        <div class="nav__logo">…</div>
        <ul class="nav__list">
          <li><a class="nav__link nav__link--active" href="…">…</a></li>
        </ul>
        <button id="theme-toggle" …>☀️</button>
        <button class="nav__toggle" aria-expanded="false">☰</button>
      </nav>
    </header>
    <main>…</main>
    <footer class="footer">
      <!-- liens mentions-legales.html, cgu.html, Facebook -->
    </footer>
    <button class="back-to-top" aria-label="Retour en haut">↑</button>
    <script src="js/main.js?v=1785752541"></script>
    <!-- js/meteo.js chargé uniquement sur meteo-astro.html -->
  </body>
</html>
```

**Exception** : `login.html` (54 lignes, 3,1 Ko) n'utilise pas `css/style.css` — styles inline uniquement, `main.js` non chargé, thème via script inline.

### 3.2 Les trois couches

```
┌──────────────────────────────────────────────────────────┐
│  COUCHE 1 : HTML STATIQUE                                │
│  11 fichiers .html — structure sémantique, contenu,      │
│  SEO (OG, JSON-LD index.html, canonical absent)          │
│  Volet Astro : 9 pages + 2 légales                       │
│  Volet Hermes : hermes.html + login.html                 │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  COUCHE 2 : CSS DESIGN SYSTEM  (css/style.css, 33,7 Ko)  │
│  • Variables CSS : 30+ tokens dans :root (couleurs,      │
│    typographie, espacements, rayons, transitions)        │
│  • Thème clair : [data-theme="light"] — surcharge        │
│    complète des tokens                                   │
│  • BEM : .nav__link, .nav__link--active, .card,          │
│    .card__text, .form__input, .form__input--error,       │
│    .back-to-top, .back-to-top--visible, .nav--open       │
│  • Responsive : 3 breakpoints (< 640 px, ≥ 640 px,       │
│    ≥ 1024 px)                                            │
│  • Google Fonts : Inter (--font-sans) +                  │
│    Space Grotesk (--font-display)                        │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  COUCHE 3 : JS COMPORTEMENTAL                            │
│  js/main.js (3,6 Ko) — chargé sur toutes les pages :     │
│    • Burger menu : .nav--open, aria-expanded             │
│    • Lien actif : .nav__link--active (pathname.pop())    │
│    • Back-to-top : .back-to-top--visible (> 400 px)      │
│    • Thème : THEME_KEY='tofdan-theme', localStorage,     │
│      updateToggleIcon(), défaut light                    │
│    • Formulaire : #contact-form, .form__input--error,    │
│      regex email, #form-success                          │
│  js/meteo.js (20,8 Ko) — chargé uniquement sur           │
│    meteo-astro.html (voir § 3.3)                         │
└──────────────────────────────────────────────────────────┘
```

### 3.3 Le composant météo (js/meteo.js, 632 lignes)

**Localisation par défaut :** Villers-la-Ville, Belgique (`DEFAULT_LAT = 50.5333`, `DEFAULT_LON = 4.6`, `DEFAULT_TZ = 'Europe/Brussels'`).

| Sous-composant | Fonction | API externe |
|---|---|---|
| `calcMoonPhase(date)` | Algorithme astronomique côté client — JDE, période 29,53058867 j → nom de phase + % illumination + âge | Aucune |
| `moonEmoji(name, illum)` | Retourne l'emoji Unicode correspondant à la phase | — |
| `cloudEmoji(cover)` | Emoji de couverture nuageuse (5 paliers) | — |
| `seeingLabel(score)` | Label qualitatif (Excellent / Bon / Moyen / Médiocre / Mauvais) | — |
| `fetchWeather()` | Appel Open-Meteo Forecast — 8 variables horaires + timezone | `api.open-meteo.com/v1/forecast` |
| `showSearchResults()` | Autocomplétion debounce 300 ms | `geocoding-api.open-meteo.com` |
| `geolocate()` | GPS navigateur → reverse geocoding | `nominatim.openstreetmap.org/reverse` |
| `saveRecent()` / `renderRecent()` | Historique FIFO 5 localisations en `localStorage` (clé `meteo_recent_locations`) | — |
| `showLoading()` / `showError()` | Spinner `#loading`, message `#error`, `display:'flex'` (correctif C2) | — |

**Les 8 indicateurs météo** mis à jour sur les cartes DOM :
`nuages-total`, `nuages-detail`, `seeing`, `humidite`, `temperature`, `vent`, `jet-stream`, `soleil` + carte lune (calcul local).

---

## 4. Flux de données

### 4.1 Flux météo principal

```
Navigateur (meteo-astro.html)
  │
  ├─ Au chargement / refresh ──► api.open-meteo.com/v1/forecast
  │    Paramètres : lat, lon, hourly=[cloudcover, cloudcover_low,
  │    cloudcover_mid, cloudcover_high, relativehumidity_2m,
  │    temperature_2m, windspeed_10m, windgusts_10m,
  │    windspeed_250hPa], timezone, forecast_days=1
  │    ◄── JSON → fetchWeather() → 8 cartes DOM mises à jour
  │
  └─ calcMoonPhase(new Date()) → carte lune (zéro réseau)
```

### 4.2 Flux géolocalisation et recherche

```
[Recherche ville]
  Utilisateur tape ──► debounce 300 ms
    ──► geocoding-api.open-meteo.com/v1/search?name=…&count=5
    ◄── JSON → liste déroulante (autocomplétion)
    → sélection → state.{lat, lon, name, timezone} mis à jour
    → fetchWeather() relancé

[Géolocalisation GPS]
  navigator.geolocation.getCurrentPosition()
    ──► nominatim.openstreetmap.org/reverse?lat=…&lon=…&format=json
    ◄── JSON → state.name mis à jour → fetchWeather() relancé

[Historique]
  Toute localisation utilisée ──► saveRecent()
    ──► localStorage['meteo_recent_locations'] (max 5, FIFO)
    → renderRecent() → chips cliquables (#recent-list)
```

### 4.3 Flux authentification Hermes

```
Visiteur ──► login.html
  │  JS inline : hash(password) comparé à la valeur attendue
  │  Si OK : document.cookie = 'hermes_auth=hermes-leo-2026; path=/'
  │
  └──► hermes.html (hub LEO)
         Tuiles :
         ├── Wikis publics GitHub Pages (target="_blank")
         ├── /bavi/      ┐
         ├── /voyages/   │ → Nginx vérifie cookie hermes_auth
         ├── /dashboard/ │   Si absent : 401/403
         └── /docs/      ┘
```

### 4.4 Flux thème jour/nuit

```
Chargement page
  └── main.js ──► localStorage.getItem('tofdan-theme')
       ├── null → data-theme="light" (défaut)
       └── 'light'|'dark' → data-theme=valeur

Clic #theme-toggle
  └── toggle light/dark
      ──► document.documentElement.setAttribute('data-theme', next)
      ──► localStorage.setItem('tofdan-theme', next)
      ──► updateToggleIcon() : '☀️' (light) / '🌙' (dark)
```

---

## 5. Sécurité

### 5.1 Frontière public / privé

La protection réelle est entièrement assurée **par Nginx côté serveur** :

```
Location /dashboard/ { require cookie hermes_auth=hermes-leo-2026 }
Location /docs/      { idem }
Location /bavi/      { idem }
Location /voyages/   { idem }
```

Sans cookie valide, Nginx renvoie 401/403 — indépendamment du JS client.

### 5.2 Auth client login.html (M1 — choix assumé)

| Élément | État |
|---|---|
| Mot de passe `Leo2026` | ⚠️ **En clair dans le JS** (visible via "Afficher le source") |
| Token `hermes-leo-2026` | ⚠️ **En clair dans le JS** |
| Contournement | Trivial (cookie posable manuellement) |
| **Décision** | **Choix assumé par Christophe (03/08/2026)** — Nginx = vrai rempart ; le password JS est un filtre de confort volontaire, non une vraie barrière de sécurité |

### 5.3 XSS et injections

| Point | État |
|---|---|
| `showSearchError()` — js/meteo.js | ✅ Corrigé (C2 → `createElement` + `textContent` au lieu de `innerHTML`) |
| Autres injections DOM | ✅ Pas d'injection de données utilisateur connue |
| Formulaire contact | ✅ Validation uniquement côté client (notice "en construction" — aucune soumission serveur) |

### 5.4 Recommandations (sans application)

1. **M1** : Déplacer la validation d'auth dans Nginx (fichier htpasswd ou script serveur) — supprimer le password du JS client.
2. **Canonical** : Ajouter `<link rel="canonical">` sur toutes les pages (absent — risque de contenu dupliqué).
3. **CSP** : Ajouter un en-tête `Content-Security-Policy` via Nginx pour limiter les sources autorisées.
4. **HTTPS** : Vérifier le certificat Let's Encrypt et la redirection HTTP → HTTPS côté LEO.

---

## 6. Performance

### 6.1 Poids des fichiers (mesuré par `wc -c`)

| Fichier | Poids (octets) | Poids (Ko) |
|---|---|---|
| `css/style.css` | 33 724 | **32,9 Ko** |
| `js/meteo.js` | 21 330 | **20,8 Ko** |
| `js/main.js` | 3 677 | **3,6 Ko** |
| `meteo-astro.html` | 9 754 | 9,5 Ko |
| `materiel.html` | 9 630 | 9,4 Ko |
| `biblio.html` | 9 737 | 9,5 Ko |
| `album.html` | 8 512 | 8,3 Ko |
| `hermes.html` | 8 180 | 8,0 Ko |
| `news.html` | 6 870 | 6,7 Ko |
| `astro.html` | 6 404 | 6,3 Ko |
| `app-astro.html` | 6 082 | 5,9 Ko |
| `mentions-legales.html` | 5 459 | 5,3 Ko |
| `chat.html` | 4 674 | 4,6 Ko |
| `index.html` | 4 739 | 4,6 Ko |
| `cgu.html` | 5 730 | 5,6 Ko |
| `login.html` | 3 156 | 3,1 Ko |
| `sitemap.xml` | 2 270 | 2,2 Ko |
| `robots.txt` | 63 | 0,06 Ko |
| **Total** | **149 991** | **~146 Ko** |

**Charge par page typique (ex. `astro.html`)** : HTML (6,3 Ko) + CSS (32,9 Ko) + JS (3,6 Ko) + Google Fonts (~30 Ko réseau CDN) ≈ **~73 Ko** — très léger.  
**Page météo** : + 20,8 Ko (meteo.js) + ~2 requêtes API réseau (Open-Meteo).

### 6.2 Stratégie cache

| Mécanisme | Implémentation |
|---|---|
| Cache-busting CSS | `css/style.css?v=1785757465` — même valeur sur toutes les pages |
| Cache-busting JS | `js/main.js?v=1785752541` — même valeur sur toutes les pages |
| localStorage | Thème (`tofdan-theme`) + localisations météo (`meteo_recent_locations`, max 5) |
| Nginx HTTP Cache | À configurer côté LEO (`Cache-Control`, `ETag`) — non vérifié |

### 6.3 Points d'attention

| # | Critère | État |
|---|---|---|
| 1 | **`@import` Google Fonts** (style.css ligne 1) | ⚠️ Render-blocking malgré `preload` dans `<head>` — cf. ADR-007 / issue m1 audit |
| 2 | **Images** | ✅ Aucune vraie image actuellement (placeholders emojis) — pas de problème de poids ; à surveiller à l'intégration des photos astropho |
| 3 | **API Open-Meteo** | ✅ Quota 10 000 req/jour — largement suffisant pour un usage personnel |
| 4 | **Compression Nginx** | À vérifier côté LEO (`gzip` ou `brotli` sur les statiques) |
| 5 | **Pas de minification** | Acceptable vu les tailles actuelles (CSS 33 Ko, JS 25 Ko) — à reconsidérer si croissance |

---

## 7. Évolutions possibles (roadmap)

### Option A — Rester statique pur (optimiser l'existant)

Préserve ADR-001 à ADR-010. Corrections incrémentales sans changement d'architecture.

| Priorité | Action | Effort |
|---|---|---|
| 🔴 Haute | Supprimer le `@import` GFonts de style.css ligne 1 (issue m1) | 15 min |
| 🔴 Haute | Ajouter `<link rel="canonical">` sur toutes les pages | 30 min |
| 🟠 Moyenne | Intégrer les vraies photos astropho dans `album.html` (WebP + lazy-load) | 2–4 h |
| 🟠 Moyenne | Créer une classe CSS `.section--flush` pour éliminer les `style="padding-top:0;"` inline répétés (issue m6) | 1 h |
| 🟡 Basse | Compléter JSON-LD sur toutes les pages (issue m12) | 1 h |
| 🟡 Basse | Marquer les emojis décoratifs `aria-hidden="true"` (issues m7, m8, m13) | 30 min |
| 🟡 Basse | Bornage du score seeing (issue m2 : jet stream > 400 km/h) | 30 min |

### Option B — Migrer vers un vrai framework statique (Astro)

Résoudrait l'issue structurelle M4 (duplication header/nav/footer × 11 fichiers) mais rompt ADR-001 à ADR-004.

| Avantage | Contrainte |
|---|---|
| Composants partagés (header, footer, nav) | Étape de build nécessaire (`npm run build`) |
| Templating (layouts, pages) | Déploiement CI/CD requis ou script `build + cp` |
| TypeScript, imports CSS par composant | Formation / montée en compétence |
| Collections Markdown pour news/blog | Migration des 11 pages HTML existantes |

**Recommandation :** L'option A est suffisante pour un site personnel de cette taille. L'option B n'est justifiée que si le contenu éditorial (news, articles) devient fréquent, ou si le nombre de pages dépasse ~20.

### Autres pistes

| Piste | Description | Prérequis |
|---|---|---|
| **Photos réelles** | Intégration des clichés astropho (Lune, Soleil, ciel profond) en WebP, responsive (`srcset`), lazy-load | Contenu disponible |
| **SEO avancé** | `canonical`, JSON-LD sur toutes les pages, sitemap images | Option A |
| **PWA** | `manifest.json` + Service Worker pour mode hors-ligne (page météo en cache) | Effort moyen |
| **Auth Hermes robuste** | Validation cookie côté Nginx uniquement, suppression du password JS client (résout M1) | Accès config Nginx LEO |
| **Compression Nginx** | `gzip` / `brotli` sur CSS/JS/HTML — gain ~70 % sur style.css | Accès config LEO |
| **GitHub Actions** | Pipeline de déploiement automatique sur push `main` → LEO | Secrets SSH dans GH |

---

## Annexe — Cohérence avec l'audit (vérification)

| Référence audit | État dans ce document |
|---|---|
| R2-R5 FAITS (mentions légales, news, sitemap, @import) | ✅ Documenté (ADR-007, §6.2, historique §7 option A) |
| M1 — choix assumé (password en clair) | ✅ ADR-008 + §5.2 |
| 11 pages HTML | ✅ §3.1 + tableau §6.1 (13 fichiers HTML dont 2 légaux) |
| 2 volets (Astro / Hermes) | ✅ §1 + §4.3 |
| Cache-busting `?v=1785757465` / `?v=1785752541` | ✅ §6.2 |
| `THEME_KEY = 'tofdan-theme'` | ✅ §3.2 + §4.4 |
| `LS_KEY = 'meteo_recent_locations'` | ✅ §3.3 + §4.2 |

---

*Document produit le 03/08/2026 — fichiers lus réellement (wc -c, grep, view). Ne pas modifier le code du site — document seul livrable.*
