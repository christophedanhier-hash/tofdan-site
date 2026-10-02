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

## A-21 — ℹ️ OUVERT — Application hébergée hors domaine

- **Statut** : **SIGNALÉ à Christophe** — aucune action décidée
- **Description** : `app-astro.html` (bouton « 🚀 Lancer l'application ») pointe vers
  `christophedanhier-hash.github.io/Projet-Astro/www/index.html` — **hors de tofdan.be**.
- **Mesuré le 02/10/2026** : le lien répond **HTTP 200** (il fonctionne).
- **Risque** : si le compte GitHub renomme, passe privé ou supprime le dépôt,
  le lien casse **sans préavis**. L'application n'est pas sous contrôle de tofdan.be.
- **Décision attendue** : conserver tel quel / rapatrier sous tofdan.be / laisser.

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

**Restent ouvertes** : A-01 (partiel), A-02, A-03, A-04, A-05, A-09, A-10,
A-14 (décision), A-20 (Michel), A-21 (décision Christophe), A-22 (mineur).

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