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

## A-01 — 🔴 Navbar non stylée sur `cgu.html` et `mentions-legales.html`

- **Statut** : CONFIRMÉ
- **Ouvert par** : Copilot CLI, revérifié par mesure directe
- **Description** : ces deux pages utilisent un gabarit de navigation abandonné. La feuille `css/style.css` ne contient **aucune** règle `.header__nav` ni `.header__nav-link` (0 occurrence vérifiée). Les liens s'affichent donc avec le style navigateur par défaut.
- **Écarts mesurés** : 5 liens au lieu de 9 · pas de bouton burger mobile · pas de bouton thème jour/nuit · **`main.js` non chargé**
- **Impact** : rupture visuelle franche quand un visiteur quitte l'univers astro ; ces pages paraissent « cassées ».
- **Note de périmètre** : ces deux fichiers figurent dans la liste ASTRO.md, mais leur correction **touche à la navigation cross-zone** (voir A-02) → validation préalable requise.

## A-02 — 🟠 Lien vers `hermes.html` depuis les pages publiques

- **Statut** : CONFIRMÉ
- **Description** : `cgu.html` et `mentions-legales.html` pointent vers `hermes.html`, qui se trouve derrière authentification par cookie.
- **Impact** : un visiteur non authentifié qui clique est renvoyé vers une page protégée (302), au lieu du point de contact public.
- **Dépendance** : le remplacement du lien est **indissociable** de A-01 (même gabarit). Décision à confirmer avec Christophe et LEO.

## A-03 — 🟠 Deux gabarits de navbar coexistent dans le dépôt

- **Statut** : CONFIRMÉ
- **Description** : dérive de gabarit classique — un modèle « astro » (9 liens, burger, thème) et un modèle « ancien » (5 liens, nu). Aucun système de template : le bloc header+nav est **répliqué à l'identique dans 8 fichiers**.
- **Cause racine** : absence de factorisation.
- **Conséquence** : toute évolution de navigation doit être répétée manuellement 8 fois, avec risque d'oubli — c'est exactement ce qui a produit A-01.

## A-04 — 🟠 `album.html` : galerie entièrement vide

- **Statut** : CONFIRMÉ
- **Description** : la galerie ne contient que des blocs `gallery__placeholder` avec emojis. **Aucune photographie réelle.**
- **Élément nouveau** : 25 photos Seestar S50 vérifiées et exploitables sont désormais disponibles (voir `inventaire-photos-seestar.md`). Le blocage n'est plus technique.
- **Décision attendue** : intégrer les photos, assumer l'état « démo », ou retirer la galerie.

## A-05 — 🟠 `chat.html` : message « formulaire en construction », aucun formulaire réel

- **Statut** : CONFIRMÉ
- **Description** : la page annonce un formulaire mais ne contient **aucune balise `<form>`**.
- **Conséquence mesurable** : tout le code de validation présent dans `main.js` (`#contact-form`, `#name`, `#email`, `#message`) est **du code mort** — il ne peut jamais s'exécuter.
- **Impact** : un visiteur ne peut pas contacter Christophe depuis cette page.

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

- **Statut** : CONFIRMÉ
- **Description** : `meteo.js` est référencé sans `?v=` sur toutes les pages qui l'utilisent, contrairement à `main.js`.
- **Impact** : une correction dans `meteo.js` peut ne pas atteindre les visiteurs ayant le fichier en cache.

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

## Synthèse

- **🔴 Grave** : 1 (A-01)
- **🟠 Majeur** : 5 (A-02, A-03, A-04, A-05, A-06) + 1 en attente de décision (A-14)
- **🟡 Mineur** : 3 (A-08, A-09, A-10)
- **🔵 Observation** : 3 (A-11, A-12, A-13)
- **Découverte de cet audit** : A-07 (lien mort SAL) — non relevé par Copilot
- **Faux positif écarté** : A-11

**Total : 14 entrées** — dont 1 infirmée et 2 observations.

### Ce que l'audit ne dit PAS

- ❌ Aucune ligne de code n'a été modifiée — `git status` vide, vérifié avant et après.
- ❌ Aucune des anomalies ci-dessus n'a été corrigée.
- ⚠️ Les « correctifs identifiés » (A-07) sont des **pistes vérifiées en ligne**, pas des modifications appliquées.

### Ordre de traitement suggéré (à valider)

1. **A-07** (lien mort) — correctif d'une ligne, bénéfice immédiat, aucun risque, hors zone partagée
2. **A-06** + **A-08** + **A-09** (og-image, cache-bust) — petits correctifs isolés
3. **A-04** (album + 25 photos vérifiées disponibles) — plus gros gain visiteur
4. **A-03** → **A-01** + **A-02** (factorisation navbar puis alignement cgu/mentions) — chantier structurel, validation cross-zone
5. **A-05** (contact) — nécessite une décision de Christophe sur le canal souhaité

---

**Sources** : audit Copilot CLI (`copilot-audit-astro.md`, 39,28 crédits, 932 k tokens) + mesures directes Gérard (grep, `sha256sum`, `git status`, `curl`) + `inventaire-photos-seestar.md`.