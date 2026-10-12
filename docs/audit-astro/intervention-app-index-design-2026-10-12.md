# Intervention — habillage de `app/index.html` aux couleurs du site

**Date** : 12/10/2026
**Demandeur** : Christophe (verbatim 1 : « *Peux tu voir ici pour que la page soit dans le meme pattern design du site et avoir un bouton pour revenir a la page https://www.tofdan.be/app-astro.html* » ; verbatim 2 : « *avant je veux que tu regarde et nous devons etre cohérent en claire par defaut et le bouton n'est aps sur la page* »)
**Périmètre** : Gérard (zone astro). **1 fichier modifié** : `app/index.html`.
**Commits** : `96583ca` (habillage + retour) · `701b2ed` (lisibilité du schéma) · `68ee66b` (thème clair par défaut + bouton visible) · `920e979` (doc) · `fae58ee` (retrait du drapeau redondant + date v3.2 Octobre 2026)
**Statut** : ✅ déployé et vérifié en production.

---

## 1. Objectif

`app/index.html` (page d'accueil de l'app « Découverte de notre Système Solaire ») était une page
**autonome** : fond noir pur, palette bleu ciel codée en dur, aucun lien de retour. Elle détonnait
visuellement par rapport au reste de tofdan.be et laissait l'utilisateur sans porte de sortie.

Deux demandes successives de Christophe :

1. **Habiller** la page à la charte du site + **ajouter un retour** vers `app-astro.html`.
2. **Corriger l'incohérence de thème** : la page apparaissait en **sombre** alors que
   `app-astro.html` (et tout le site) est en **clair par défaut** — et le bouton de retour,
   présent dans le code, n'était **pas perceptible** à l'écran.

## 2. Décisions de cadrage (Christophe)

- Traitement limité à **`app/index.html` seule** — les 4 simulateurs ne sont pas touchés.
- **Pas de menu de navigation** du site dans l'app : l'app reste immersive. Juste l'identité
  visuelle (palette, typographie, header/footer) + un bouton de retour.
- **Cohérence** : la page doit se comporter **comme les autres pages du site** = clair par défaut.

## 3. Matériel / fichiers

| Fichier | Rôle | Touché |
|---|---|---|
| `app/index.html` | page d'accueil de l'app | ✅ **seul fichier modifié** |
| `css/style.css` | charte du site (chargée en `../css/style.css`) | ❌ non modifié |
| `js/main.js` | thème clair/sombre (chargé en `../js/main.js`) | ❌ **non modifié** (fichier partagé 12 pages) |
| `app/css/main.css` | CSS autonome des 4 simulateurs | ❌ non modifié |
| `app/Simulateur_*.html` (×4) | simulateurs | ❌ non modifiés |

## 4. Procédure appliquée

1. **Cadrage** — 2 questions à Christophe (périmètre : page seule ou app entière ? menu ou pas ?).
2. **Mesure de l'existant** — `app/index.html` = 349 lignes, CSS autonome, palette bleu ciel
   (`#4da8da`, `#020205`), 5 liens internes, **0 retour**.
3. **Sauvegarde** — hash SHA-256 du fichier d'origine relevé avant toute modification.
4. **Production du code déléguée à Copilot CLI** (`claude-sonnet-5.5`, harnais `copilot-brief.py`,
   session `3524b6d7`, `--log`), brief de 204 lignes dans `/tmp/brief-app-index.md`.
5. **Vérification indépendante** (le CR de Copilot n'est pas une preuve) :
   - périmètre : `git status` → **1 seul fichier** ;
   - 8/8 liens testés en HTTP → **200** ;
   - contrastes calculés dans les 2 thèmes → **AA** ;
   - modal + recherche du guide → **fonctionnels** (7 sections, 24 puces ; recherche « zoom » → 1/35).
6. **Corrections complémentaires** trouvées par la vérification (voir §5).
7. **Correctif de cohérence de thème** (2ᵉ demande, voir §6).
8. **Commit → push `deploy main` → déploiement → vérification en production.**

## 5. Défauts trouvés et corrigés (non signalés par Copilot)

| # | Défaut | Mesure | Correction |
|---|---|---|---|
| 1 | Labels des bras spiraux en `rgba(255,255,255,0.4)` **codé en dur** dans le JS → invisibles en thème clair | — | couleur choisie selon le thème |
| 2 | Le canvas **ne se redessinait pas** au changement de thème | — | `MutationObserver` sur `data-theme` |
| 3 | « Bras de la Règle-Cygne » **tronqué** (largeur 106 px centré en x=48 → début à **−5 px**) | débordement mesuré | labels ramenés dans le canvas |
| 4 | Contraste des labels **2.40:1** (seuil AA = 4.5) | ratio calculé | `0.85` en sombre, `0.9` en clair |
| 5 | Les labels **croisaient les bandes bleues** — halo inopérant (ombre sombre = couleur du fond) | moyenne de zone : `[52,55,69]` vs fond `[3,4,5]` | pastille arrondie semi-opaque + bordure fine + police `600` |

## 6. Incohérence de thème (2ᵉ demande) — cause unique, deux symptômes

**Constat de Christophe** : capture côte à côte — `app-astro.html` **clair** (gauche),
`app/index.html` **sombre** (droite). Même app, deux ambiances opposées.

**Cause unique** : `app/index.html` **ne chargeait pas `js/main.js`**.

| Conséquence | Explication |
|---|---|
| Page **sombre** au lieu de claire | Sans `main.js`, `<html>` reste **sans `data-theme`**. Le CSS du site tombe alors sur son défaut `:root:not([data-theme="light"])` = **sombre**. Partout ailleurs `main.js` pose `light` (ligne 92-95 : « Défaut : jour »). |
| Bouton retour **quasi invisible** | `.btn--outline` = `background: transparent` + `border: 1px solid var(--color-border)`. En sombre, bordure grise sur fond bleu nuit = **imperceptible**. |

**Correctif appliqué** (3 points) :

1. Chargement de `../js/main.js` (chemin relatif, la page est dans `app/`) + bouton `#theme-toggle`,
   **exactement comme les 11 autres pages du site**.
2. Ordre de chargement : `main.js` **APRÈS** `#theme-toggle` — `main.js` câble son écouteur au
   chargement (`if (toggleBtn)`), donc chargé avant, **le bouton resterait inerte**.
   *Piège rencontré et corrigé pendant l'intervention : placé d'abord avant le script inline pour
   éviter un flash, le clic ne répondait plus (`apres_clic` restait `light`).*
3. Bordure/fond explicites pour `.retour-site .btn--outline` dans les 2 thèmes.

## 7. Checklist de validation

- [x] `app/index.html` = **seul fichier modifié** (`+160 −110`, puis `+32 −2`, puis `+22`)
- [x] `js/main.js`, `css/style.css`, `app/css/main.css`, 4 simulateurs → **intacts**
- [x] Charte du site appliquée : police `Inter`, palette violet/indigo
- [x] 2 boutons « ← Retour au site » → `../app-astro.html` → **HTTP 200** (170×50 px, visibles)
- [x] 8/8 liens internes/externes testés → **200**
- [x] Contrastes AA dans les **2 thèmes** (titre `h1` : 15.90 sombre / 13.98 clair)
- [x] Modal du guide : ouverture, 7 sections, 24 puces, fermeture, scroll restauré
- [x] Recherche du guide : 1 résultat / 34 masqués
- [x] Canvas : thème sombre ↔ clair → **redessiné** (mesuré : `[42,32,67]` ⇄ `[37,54,60]`)
- [x] 4/4 labels **entièrement dans le canvas** (plus de troncature)
- [x] **Thème clair par défaut** sur visiteur neuf (`localStorage` vide) → `data-theme="light"`
- [x] **Bascule fonctionnelle** en local **et en production** : `light → dark → light`
- [x] `localStorage` mémorise le choix (`tofdan-theme`)
- [x] **Cohérence** avec `app-astro.html` : `main.js` + `theme-toggle` présents sur les 2
- [x] Balises `<script>` équilibrées (2/2)
- [x] Aucun identifiant / secret exposé

## 8. Source

- Demandes : Christophe, 12/10/2026 (2 captures de `tofdan.be/app/index.html` + verbatims ci-dessus).
- Méthode : harnais `copilot-brief.py` (skill `cli-agents-hermes`), modèle `claude-sonnet-5.5`.
- Vérification : mesures navigateur (`browser_console`, `browser_vision`) + `curl` HTTP.
- Règle appliquée : **le compte-rendu d'un agent n'est pas une preuve** — 5 défauts trouvés
  par la vérification indépendante, dont 3 invisibles au CR de Copilot.
- Règle appliquée : **une mesure qui contredit l'écran est à vérifier deux fois** — le bug du
  clic inerte a été trouvé parce que le test portait sur le **comportement**, pas sur le code.

---

## 9. Suite — retrait du repère redondant + mise à jour de date (même jour)

**Demande Christophe (verbatim)** : « *non les simulateurs reste en sombre rien a changer pour eux, pour le reste retire un des repére qui n'est pas correste et modifie la date a octobre 2026* »

Cadrage demandé et obtenu **avant d'agir** (la consigne « modifie la date » pouvait inclure les
simulateurs — 5 mentions de « Mars 2026 » au total) :

| Question | Réponse Christophe |
|---|---|
| Jusqu'où corriger la date ? | **`app/index.html` uniquement** — les 4 simulateurs gardent « Version 3.1 (Mars 2026) » |
| Quel libellé exact ? | **« v3.2 (Octobre 2026) »** — la date change **et** la version s'incrémente |

**Repère fautif identifié par mesure** (pas au jugé) : le `.marker-label` contient déjà
**« 📍 Système Solaire (Bras d'Orion) »**, et un second `<span class="marker-flag">🚩</span>`
était **empilé dessous** (`flex-direction: column`). Deux symboles pour un seul point ⇒ le
drapeau était **le redondant**. Retiré (balise **et** règle CSS `.marker-flag` devenue orpheline).

**Point de vigilance vérifié** : le marqueur passe de **66 px à 27 px** de hauteur. Étant positionné
en absolu avec un `translate`, un décalage était possible. **Mesuré après coup** : le badge reste
aligné sur le bras de la galaxie, aucun chevauchement. Contraste du badge : **13.41:1** (AA = 4.5),
identique dans les 2 thèmes.

- Fichier : `app/index.html` — **+2 −4** (drapeau retiré, CSS orphelin nettoyé, 2 dates corrigées)
- **4 simulateurs, `main.js`, `style.css` : intacts** (vérifié par `git status`)
- Commit `fae58ee`, poussé et déployé ; **vérifié en production** : `v3.2 (Octobre 2026)`,
  **0 occurrence** de « Mars 2026 » dans la page, drapeau **absent du code servi**