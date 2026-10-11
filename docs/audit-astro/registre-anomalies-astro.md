# Registre des anomalies — Zone ASTRO tofdan.be

**Version** : 1.0 — 26 septembre 2026
**Commit audité** : `87a1f32` — arbre git propre, **aucune modification effectuée**
**Auteur** : Gérard

> **Convention de gravité**
> - 🔴 **Bloquant / grave** — casse l'expérience visiteur ou trompe l'utilisateur
> - 🟠 **Majeur** — incohérence visible, dette structurelle
> - 🟡 **Mineur** — qualité, cohérence, finition
> - 🔵 **Observation** — pas un défaut, mais à connaître

> **Convention de statut** : `OUVERT` · `CONFIRMÉ` (reproduit) · `INFIRMÉ` (faux positif écarté) · `RÉSOLU`

---

## A-01 — ✅ RÉSOLU (11/10/2026) — Navbar non stylée sur `cgu.html` et `mentions-legales.html`

- **Statut** : **CORRIGÉ** — commits `52f8c7a` (header unifié) et *à venir* (contact)
- **Cause** : ces deux pages utilisaient un gabarit de navigation abandonné (« TOFDAN » nu, 5 liens, sans burger ni bouton thème, `main.js` non chargé).
- **Correction** : `tools/generate-nav.py` a réécrit `<header>` et `<footer>` depuis un modèle unique sur les 11 pages → ces deux pages ont désormais **le header astro complet** (burger, thème, 10 liens).
- **Preuve** : **1 seule signature de `<header>` sur 11/11 pages** ; `main.js` désormais chargé sur les 2 pages.
- **Reste** : sur `mentions-legales.html`, la phrase « vous pouvez contacter l'éditeur via le site » est **vague mais vraie** depuis l'ajout du formulaire (elle était fausse avant).

## A-02 — ✅ RÉSOLU (11/10/2026) — Lien vers `hermes.html` depuis les pages publiques

- **Statut** : **CORRIGÉ** — commit `52f8c7a`
- **Correction** : le header unique pointe vers **`/hermes/`** (URL canonique) sur les 11 pages,
  au lieu du lien mort/erroné vers `hermes.html`. Vérifié : `hermes.html` et `/hermes/` mènent
  tous deux au même écran d'authentification (302 → `/hermes/auth/google`).
- **Note** : le libellé est désormais **`🤖 Hermes`** partout (3 écritures coexistaient : absent,
  « Hermès » accentué, « 🤖 Hermes »).

## A-03 — ✅ RÉSOLU (11/10/2026) — Deux gabarits de navbar coexistent dans le dépôt

- **Statut** : **CORRIGÉ** — commit `52f8c7a`
- **Correction** : `tools/generate-nav.py` (193 lignes) = **source unique** de `<header>` et
  `<footer>` pour les 11 pages astro. Mode **dry-run par défaut** ; `--apply` écrit et crée un `.bak`.
- **Preuve** : **1 seule signature** de header **et** de footer sur les 11 pages (contre 3 variantes
  de header auparavant). **RÈGLE D'OR** inscrite dans `ASTRO.md` : ne plus jamais éditer un
  `<header>`/`<footer>` à la main.

## A-04 — ✅ INFIRMÉE le 11/10/2026 — `album.html` est REMPLIE (25 photos)

- **Statut initial** : CONFIRMÉ — « la galerie ne contient que des blocs `gallery__placeholder` avec emojis. Aucune photographie réelle. »
- **RECTIFICATION (11/10/2026)** : **le constat est FAUX**. Mesures :
  - `images/album/` → **25 fichiers `.jpg`**, **2,1 Mo** au total.
  - `album.html` → **25 balises `<img>`**, **toutes** pointant vers `images/album/…`.
  - **0 doublon** : les 25 empreintes MD5 sont **toutes distinctes** (les ressemblances
    `c23-ngc891.jpg` / `ngc891.jpg` sont des **versions différentes**, pas des copies).
  - **6 catégories** présentes (Lune, Soleil, Planètes, Ciel profond, …), `alt` descriptifs,
    dates d'observation, vignettes cliquables.
  - Vérifié **en production** : `tofdan.be/album.html` affiche bien les 25 figures.
- **Cause de l'erreur** : le constat datait de septembre 2026 ; **la galerie a été remplie
  depuis**, mais le registre n'a pas été mis à jour. J'ai moi-même relayé ce constat périmé
  le 11/10 avant de le vérifier — **c'est l'erreur que cette entrée corrige**.
- **⚠️ Conséquence méthodologique** : ne jamais présenter une anomalie de registre comme
  actuelle **sans la re-mesurer**. Un registre qui n'est pas re-vérifié devient une source
  de fausses croyances.
- **Action** : **aucune** — la galerie est fonctionnelle. Seule piste d'amélioration :
  le poids (2,1 Mo) et l'absence de miniatures redimensionnées.

## A-05 — ✅ RÉSOLU (11/10/2026) — `chat.html` : aucun moyen réel de contacter

- **Statut** : **CORRIGÉ**
- **⚠️ Correction du constat initial** : j'avais écrit « la page annonce un formulaire mais ne
  contient aucune `<form>` ». **Faux après vérification** : la page affichait honnêtement
  « Formulaire en construction » et renvoyait vers Facebook. Ce n'était pas un mensonge,
  **c'était un aveu** — mais le visiteur n'avait effectivement **aucun moyen d'écrire**,
  et `mentions-legales.html` affirmait à tort qu'un formulaire existait.
- **Correction apportée** : formulaire de contact réel (nom, e-mail, message) → à la soumission,
  ouverture du **client mail** du visiteur, pré-rempli (objet + corps).
- **Décisions de Christophe** : adresse `christophe.danhier@gmail.com` ; mécanisme **mailto**.
- **Anti-spam** : l'adresse **n'est pas présente en clair** dans le HTML servi
  (`occurrences de « danhier@gmail » = 0`). Elle est assemblée par le JavaScript.
- **Réutilisation** : le code de validation de `main.js` (`#contact-form`, `#name`, `#email`,
  `#message`) **n'était pas mort par accident** — il attendait exactement ce formulaire.
  Il est désormais **actif** (vérifié : validation à vide → 3 erreurs affichées ;
  valide → formulaire masqué + message de succès + `mailto:` construit).
- **Correction associée** : `mentions-legales.html` disait « Contact : via le formulaire
  disponible sur le site » **alors qu'aucun formulaire n'existait** — indication fausse dans
  une page légale. Remplacée par l'adresse (obfusquée) **et** un lien vers la page Contact.
- **Livré par** : Copilot CLI (`claude-sonnet-5.5`), brief et vérification par Gérard.

## A-06 — 🟠 `og:image` pointe vers un fichier absent

- **Statut** : CONFIRMÉ
- **Description** : la métadonnée sociale référence `https://tofdan.be/og-image.jpg`, fichier **absent du dépôt**.
- **Impact** : toute carte de partage (Telegram, Facebook, X, LinkedIn) s'affiche sans visuel, alors que le dépôt contient de meilleures images disponibles.

## A-07 — 🟠 Lien mort vers le site de la Société Astronomique de Liège

- **Statut** : CONFIRMÉ — **découverte de cet audit, non relevée par Copilot**
- **Emplacement** : `biblio.html`, rubrique « Liens Utiles », présenté comme « socle de l'astronomie amateur en Belgique »
- **Mesure** : `https://www.sal.ulg.ac.be/` → **DNS ne résout pas, HTTP 000**
- **Correction identifiée et vérifiée** : la SAL est désormais hébergée à `https://www.societeastronomique.uliege.be/` → **HTTP 200** (testé le 26/09/2026)
- **Contrôle des 6 autres liens** de la rubrique (SiriL, Stellarium, Nighttime Imaging, Heavens Above, Light Pollution Map, SharpCap) : **tous HTTP 200** ✅

## A-08 — 🟡 `index.html` chargé sans versionnement d'asset

- **Statut** : CONFIRMÉ
- **Description** : c'est la **seule page sans `?v=`** sur `style.css` / `main.js`. Toutes les autres pages astro sont versionnées.
- **Impact** : Cloudflare peut servir une version obsolète après un déploiement, sur la page d'entrée du site — la plus visible.
- **Note de périmètre** : `index.html` est la **seule page partagée** (ASTRO.md) → modification soumise à accord.

## A-09 — 🟡 `js/meteo.js` jamais versionné

- **Statut** : CONFIRMÉ — **re-mesuré le 11/10/2026**
- **Description** : `meteo.js` est référencé sans `?v=` sur les pages qui l'utilisent, contrairement à `main.js` (`?v=1785752541`, cohérent sur 11 pages).
- **Mesure du 11/10/2026** : `grep -o "meteo.js?v=[0-9]*" *.html` → **0 occurrence**. Le fichier pèse **21 330 o** (632 lignes).
- **Impact** : une correction dans `meteo.js` peut ne pas atteindre les visiteurs ayant le fichier en cache. Même classe de défaut que `contact-chat.js` (corrigé le jour même).
- **Correctif** : ajouter `?v=<timestamp>` sur les références de `meteo.js`. ⚠️ Non appliqué — à faire dans un lot dédié (le fichier n'est pas dans la liste des fichiers touchés par le Lot 5).

## A-10 — 🟡 Neuf blocs `<script>` inline, dupliqués

- **Statut** : CONFIRMÉ — **précision apportée à l'analyse Copilot**
- **Description** : la logique de thème (`classList.toggle`, `localStorage`) et le menu burger sont **écrits inline en fin de `<body>`** dans les pages astro, en plus de `main.js`.
- **Précision importante** : Copilot affirme que `main.js` contient la logique de thème. **C'est inexact** — `main.js` fait 119 lignes et se comporte en guetteur de DOM. Elle est désormais **inline et dupliquée 9 fois**.
- **Risque réel** : les 9 copies peuvent diverger silencieusement. Le risque est **plus dispersé** que ce que Copilot décrit.

## A-11 — 🔵 Correction factuelle : retour-haut de `main.js`

- **Statut** : **INFIRMÉ** (faux positif écarté)
- **Affirmation Copilot** : le bouton retour-haut de `main.js` écoute `hashchange`, qui « ne se déclenche jamais » depuis un `<a href="#…">`, donc le bouton « ne fonctionne pas ».
- **Rectification** : un clic sur `<a href="#top">` **modifie bien** `location.hash` et **déclenche** `hashchange`. L'affirmation est fausse ; le bouton fonctionne.
- **Conservé ici** pour éviter que ce point soit « recorrigé » à tort lors d'un lot ultérieur.

## A-12 — 🔵 Qualité du contenu : déclaratif non vérifiable

- **Statut** : OBSERVATION
- **`materiel.html`** : les specs (SkyWatcher 200/1000 PDS sur EQ6-R, Maksutov 127, lunette 80/600 ED) sont **techniquement cohérentes**, mais rien ne permet de vérifier que ce matériel est réellement possédé. ⚠️ À faire confirmer par Christophe.
- **`news.html`** : trois articles datés **avril, mai et juin 2026** — plausibles puisque antérieurs au 26/09/2026, mais **impossible de confirmer** que ce sont de vrais événements. ⚠️
- **Éléments vérifiés comme authentiques** : ✅ les 3 ouvrages de `biblio.html` (Legault, Cannat, Tirion) existent réellement · ✅ le lien de `app-astro.html` répond **HTTP 200** (application « Guide de l'Utilisateur v3.1 ») · ✅ `meteo-astro.html` interroge 3 API réelles (Open-Meteo, geocoding, Nominatim) avec `try/catch` et repli local sur la phase lunaire — **la page la plus solide de la zone**.

## A-13 — 🔵 Risque de modification : assets partagés

- **Statut** : OBSERVATION
- **Description** : `js/main.js` et `css/style.css` (33 Ko) sont partagés par 8 à 10 pages. Renommer une classe casse menu mobile **et** thème sur toute la zone d'un coup.
- **Recommandation** : toute modification de classe doit être précédée d'un recensement des usages, et les lots doivent être atomiques (HTML + CSS + JS ensemble).

## A-14 — 🟠 Fichiers générés (audit) non exclus du versionnement

- **Statut** : **NOUVEAU** — constat de cet audit
- **Description** : le présent dossier `docs/audit-astro/` contient des documents de travail. Aucune règle `.gitignore` ni consigne ASTRO.md ne précise s'il doit être publié.
- **Décision attendue** : publier (documentation utile) ou garder privé ? À trancher avant tout commit.

---

## A-15 — ✅ RÉSOLU (02/10/2026) — `index.html` : 2 liens morts `href="#"`

- **Statut** : **CORRIGÉ** — commit `f7b4c88`
- **Description** : le pied de page pointait vers `href="#"` pour « Mentions légales »
  et « Conditions d'utilisation », **alors que les 2 cibles existent** dans le dépôt.
  `astro.html` faisait déjà correctement le lien — seule la page d'accueil était cassée.
- **Correction** : `href="#"` → `mentions-legales.html` / `cgu.html`.
- **Vérification** : `href="#"` restants = **0** en production.

## A-16 — ✅ RÉSOLU (02/10/2026) — `index.html` sans `og:image`

- **Statut** : **CORRIGÉ** — commit `f7b4c88`
- **Description** : la page d'accueil était la **seule** sans `<meta property="og:image">`
  (les 12 autres en avaient un, cassé — cf. A-06). C'est pourtant la page la plus partagée.
- **Correction** : ajout des 4 balises `og:*` (`type`, `url`, `title`, `description`, `image`).

## A-17 — ✅ RÉSOLU (02/10/2026) — `index.html` chargé sans versionnement

- **Statut** : **CORRIGÉ** — commit `f7b4c88` (complète A-08)
- **Description** : `css/style.css` était appelé **sans `?v=`** — la page était donc
  la seule à ne bénéficier d'aucun cache-bust. Même famille de risque que A-08,
  mais **plus grave** : sans `?v=` du tout, aucun moyen d'invalider le cache.
- **Correction** : `style.css?v=1790954759`, comme les 10 autres pages.

## A-18 — ✅ RÉSOLU (02/10/2026) — Espaces insécables absentes (typographie française)

- **Statut** : **CORRIGÉ** — commit `f7b4c88`
- **Description** : aucune page ne respectait la règle française d'espace insécable
  avant `; ! ? : »` et après `«`. Détecté au **rendu** : le `!` de « Bonne visite ! »
  passait seul à la ligne. **11 cas** répartis sur 5 pages.
- **Correction** : espace fine insécable `U+202F` avant `; ! ?`,
  espace insécable `U+00A0` avant `: »` et après `«` — appliquée à 10 pages.
- **Contrôle** : 13 fichiers HTML, **0 erreur de parsing**, 0 cas restant.
  Concerne aussi 2 attributs `<meta content>` de `chat.html` (valide en UTF-8).

## A-19 — ✅ RÉSOLU (02/10/2026) — `ASTRO.md` : périmètre faux sur `index.html`

- **Statut** : **CORRIGÉ** — commit `f7b4c88`
- **Description** : `ASTRO.md` classait `index.html` en « fichier PARTAGÉ —
  modification interdite sans accord » et le décrivait comme la page
  « deux univers, un seul site ». **Les deux affirmations étaient fausses** :
  `index.html` est la page d'accueil **astro** servie par nginx sur `/`.
  *(Le contenu réel ne correspondait pas non plus à la description : c'est bien
  une page astro — hero « ASTRO PHOTOGRAPHIE », bandeau, « En Vedette ».)*
- **Cause** : le document datait d'avant la restauration de l'accueil (commit
  `87a1f32`, 26/09) et n'avait pas été mis à jour.
- **Correction** : clarification explicite de Christophe le 02/10/2026 ;
  périmètre porté à **14 fichiers** (13 + `index.html`), plus aucun fichier partagé.
- **Leçon** : un document de périmètre se vérifie comme du code — `ASTRO.md`
  portait une affirmation non mesurée, et c'est ce qui m'a fait m'arrêter à tort.

## A-20 — ℹ️ OUVERT — `hermes.html` reste en `?v=1785757465`

- **Statut** : **SIGNALÉ** (zone Michel, message Hive `20261002T201732-5e842a`)
- **Description** : les 11 pages astro sont alignées sur `?v=1790954759`,
  `hermes.html` porte encore l'ancienne valeur. Même piège de cache qu'A-08.
- **Action** : aucune de mon côté — zone Hermes. **Signalé à Michel.**

## A-21 — ✅ RÉSOLUE le 11/10/2026 — Application rapatriée sous tofdan.be

- **Statut** : **RÉSOLUE** — l'application est désormais servie par `tofdan.be`
- **Description initiale** : `app-astro.html` (bouton « 🚀 Lancer l'application ») pointait vers
  `christophedanhier-hash.github.io/Projet-Astro/www/index.html` — **hors de tofdan.be**.
- **Résolution** : l'application a été **rapatriée** dans `app/` (10 fichiers, 1,5 Mo,
  autonome).  Le bouton pointe désormais vers **`app/index.html`**.
- **Vérifié le 11/10/2026** : `tofdan.be/app/` → **10/10 fichiers en HTTP 200** ;
  canvas **1280×633**, **WebGL 2.0 actif**, **0 erreur JS** ; **0 référence `github.io`**
  subsistante sur le site. Commit `52f8c7a`.
- **Bénéfice** : l'application est désormais **sous contrôle de tofdan.be** ; le risque de
  rupture silencieuse (renommage / suppression du dépôt GitHub) est **écarté**.

## A-22 — ℹ️ OBSERVATION — Poids de `js/meteo.js`

- **Statut** : **OBSERVÉ**
- **Description** : `js/meteo.js` = **21 330 octets (632 lignes)**, soit ~16 % du poids
  total du site — et il n'est utilisé **que** par `meteo-astro.html`.
- **Piste** : chargement `defer` (probablement déjà le cas) ou découpage.
  **Non prioritaire.**

---

## Synthèse

- **🔴 Grave** : 1 (A-01)
- **🟠 Majeur** : 5 (A-02, A-03, A-04, A-05, A-06) + 1 en attente de décision (A-14)
- **🟡 Mineur** : 3 (A-08, A-09, A-10)
- **🔵 Observation** : 3 (A-11, A-12, A-13)
- **Découverte de cet audit** : A-07 (lien mort SAL) — non relevé par Copilot
- **Faux positif écarté** : A-11

**Total : 22 entrées** — dont 1 infirmée et 2 observations.

### ✅ Résolues le 02/10/2026 (commit `f7b4c88`)

| Anomalie | Objet | Preuve |
|---|---|---|
| **A-06** | `og-image.jpg` 404 sur 14 pages | fichier créé 1200×630, 68 Ko, **200 en production** |
| **A-08** | cache-bust divergent | **11/11** pages alignées sur `?v=1790954759` |
| **A-15** | `href="#"` sur l'accueil | **0** lien mort en production |
| **A-16** | accueil sans `og:image` | 4 balises `og:*` ajoutées |
| **A-17** | accueil sans `?v=` | `?v=1790954759` |
| **A-18** | espaces insécables | 10 pages, **0** cas restant |
| **A-19** | `ASTRO.md` périmé | périmètre corrigé à 14 fichiers |

### ✅ Résolues le 02/10/2026 (commit `52f8c7a`)

Lot 4 — décisions de Christophe : « 1) option A 2) Option A 3) Option A ».

| Anomalie | Objet | Preuve |
|---|---|---|
| **A-11** | bouton app vers GitHub Pages (domaine tiers) | app rapatriée sous `app/` ; lien relatif ; **0 référence `github.io`** ; 10/10 fichiers en 200 ; canvas WebGL actif |
| **A-03** | deux gabarits de navbar coexistent | **1 seule** signature de `<header>` sur **11/11** pages en production |
| **A-10** | `<header>` dupliqué 9× / 3 variantes | `tools/generate-nav.py` (dry-run par défaut) ; header **et** footer générés depuis un modèle unique |
| **A-04** | album — 25 photos | **mesuré : 25/25 ont déjà `loading=`** — l'anomalie n'existait pas (constat d'audit erroné) |
| **A-07** | lien SAL « mort » | **mesuré : URL valide, HTTP 200** — l'anomalie n'existait pas (constat d'audit erroné) |

> **Défaut supplémentaire corrigé au passage, non répertorié** : le logo divergeait
> selon la page (« 🌙 ASTRO PHOTOGRAPHIE » sur 9 pages, « TOFDAN » sur 2) et
> **8 pages sur 11 n'avaient aucun lien vers Hermes** — avec 3 écritures différentes
> (« absent », « Hermès », « 🤖 Hermes »). Le header unique les harmonise.

**Restent ouvertes** : A-04 (à re-qualifier), A-09 (cache-bust `meteo.js`), A-10 (scripts inline), A-14 (décision), A-20 (Michel), A-22 (mineur).
**✅ Résolues** : A-01, A-02, A-03, A-05, A-06, A-08, A-11 (infirmée), A-12, A-15, A-16, A-17, A-18, A-19, A-21.
**⚠️ Écart corrigé le 11/10/2026** : cette ligne listait A-01, A-02 et A-05 comme ouvertes **alors que le registre les donnait résolues depuis les commits `52f8c7a`/`904ab00`**. La synthèse était périmée par rapport au corps du document. A-21 est passée « en attente de décision » → **résolue** (application rapatriée).

### ✅ Résolues le 11/10/2026 — Lot 5 « contact » (délégation Copilot)

Travail **délégué à Copilot CLI** (`claude-sonnet-5.5`) et **vérifié par Gérard** —
premier chantier mené en délégation complète, dans le dépôt, conformément à la
consigne de Christophe (« tu délègues complètement le dev et tu orchestres »).

| Anomalie | Objet | Preuve |
|---|---|---|
| **A-05** | `chat.html` sans moyen de contact | formulaire réel (3 champs) ; validation active ; `mailto:` construit ; adresse **absente du HTML servi** |
| **A-01** | navbar non stylée (2 pages) | header astro complet ; `main.js` chargé ; **1 signature `<header>` sur 11 pages** |
| **A-02** | lien vers `hermes.html` | pointe vers **`/hermes/`** (canonique) sur les 11 pages |

> **Ce que Copilot a livré :** HTML conforme aux IDs attendus par `main.js` (contrainte la plus
> subtile du brief) ; `main.js` **intact** ; obfuscation de l'adresse (`gm`+`ail`) ; structure
> `.form__error` correcte (le CSS fonctionne).
>
> **Ce que Copilot a raté :** 1 tâche sur 4 **inachevée** au 1er passage (balise `<script>` ajoutée
> aux mentions légales **sans corriger la phrase fausse**) ; **son résumé était faux**
> (`+36 -0` annoncé, `+32 -4` réel). Corrigé au 2ᵉ passage (reprise de session).
>
> **Leçon confirmée** : un « c'est fait » d'agent **n'est pas une preuve**. Sans relecture,
> une page légale aurait continué à indiquer un formulaire inexistant.

### 🚨 Faux positifs de Gérard écartés le 11/10/2026

Trois constats alarmants se sont révélés **faux** — tous de la même famille : **l'instrument
de mesure, pas le code**.

1. **« Les erreurs du formulaire ne s'affichent pas »** → faux : mon regex de contrôle était
   incorrect. Vérification manuelle : la structure `.form__error` est conforme, le CSS fonctionne.
2. **« Le formulaire accepte une soumission vide »** → faux : mon clic sur le bouton
   **ne déclenchait pas** le `submit` natif dans le navigateur headless. Avec `requestSubmit()`,
   la validation fonctionne parfaitement.
3. **« `<strong></strong>` vides dans les mentions légales »** → faux : l'arbre d'accessibilité
   du navigateur headless **n'affiche pas** le contenu des `<strong>`. Le HTML réel contient
   bien `tofdan.be` et `LEO Server`.

> **Leçon n°2, trois fois dans la même journée** : « tout est cassé » est presque toujours
> **mon test qui est cassé**. Ne jamais conclure d'une seule mesure ni d'un seul outil.

### Ce que l'audit ne dit PAS

> **⚠️ Mise à jour du 02/10/2026** — ce paragraphe décrivait l'état **au moment de
> l'audit initial**. Il était exact alors ; il ne l'est plus aujourd'hui.

- ❌ **À la date de l'audit** : aucune ligne de code n'avait été modifiée
  (`git status` vide, vérifié avant et après).
- ❌ **À la date de l'audit** : aucune des anomalies ci-dessus n'était corrigée.
- ⚠️ Les « correctifs identifiés » (A-07) sont des **pistes vérifiées en ligne**,
  pas des modifications appliquées. *(A-07 n'est toujours pas appliqué.)*
- ✅ **Le 02/10/2026, 7 anomalies ont depuis été corrigées** (A-06, A-08, A-15,
  A-16, A-17, A-18, A-19) — commit `f7b4c88`, déployé et vérifié en production.
  Voir le tableau « Résolues le 02/10/2026 » ci-dessus.

### Ordre de traitement suggéré (à valider)

1. **A-07** (lien mort) — correctif d'une ligne, bénéfice immédiat, aucun risque, hors zone partagée
2. **A-06** + **A-08** + **A-09** (og-image, cache-bust) — petits correctifs isolés
3. **A-04** (album + 25 photos vérifiées disponibles) — plus gros gain visiteur
4. **A-03** → **A-01** + **A-02** (factorisation navbar puis alignement cgu/mentions) — chantier structurel, validation cross-zone
5. **A-05** (contact) — nécessite une décision de Christophe sur le canal souhaité

---

**Sources** : audit Copilot CLI (`copilot-audit-astro.md`, 39,28 crédits, 932 k tokens) + mesures directes Gérard (grep, `sha256sum`, `git status`, `curl`) + `inventaire-photos-seestar.md` + **audit Pi du 02/10/2026** (mesures de tailles/lignes corroborées à 6/6 ; ses constats négatifs NON retenus — Pi a affirmé « `<footer>` : 0 » alors que les 8 pages en ont un).