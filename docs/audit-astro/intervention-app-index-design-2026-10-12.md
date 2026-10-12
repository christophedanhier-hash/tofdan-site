# Intervention — habillage de `app/index.html` aux couleurs du site

**Date** : 12/10/2026
**Demandeur** : Christophe (verbatim : « *Peux tu voir ici pour que la page soit dans le meme pattern design du site et avoir un bouton pour revenir a la page https://www.tofdan.be/app-astro.html* »)
**Périmètre** : Gérard (zone astro). 1 fichier modifié.
**Commits** : `96583ca` (habillage + retour) · `701b2ed` (lisibilité du schéma)
**Statut** : ✅ déployé et vérifié en production.

---

## 1. Objectif

`app/index.html` (page d'accueil de l'app « Découverte de notre Système Solaire ») était une page
**autonome** : fond noir pur, palette bleu ciel codée en dur, aucun lien de retour. Elle détonnait
visuellement par rapport au reste de tofdan.be et laissait l'utilisateur sans porte de sortie.

Objectif : **appliquer la charte du site** et **ajouter un retour vers `app-astro.html`**.

## 2. Décisions de cadrage (Christophe)

- Traitement limité à **`app/index.html` seule** — les 4 simulateurs ne sont pas touchés.
- **Pas de menu de navigation** du site dans l'app : l'app reste immersive. Juste l'identité
  visuelle (palette, typographie, header/footer) + un bouton de retour.

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
7. **Commit → push `deploy main` → déploiement → vérification en production.**

## 5. Défauts trouvés et corrigés (non signalés par Copilot)

| # | Défaut | Mesure | Correction |
|---|---|---|---|
| 1 | Labels des bras spiraux en `rgba(255,255,255,0.4)` **codé en dur** dans le JS → invisibles en thème clair | — | couleur choisie selon le thème |
| 2 | Le canvas **ne se redessinait pas** au changement de thème | — | `MutationObserver` sur `data-theme` |
| 3 | « Bras de la Règle-Cygne » **tronqué** (largeur 106 px centré en x=48 → début à **−5 px**) | débordement mesuré | labels ramenés dans le canvas |
| 4 | Contraste des labels **2.40:1** (seuil AA = 4.5) | ratio calculé | `0.85` en sombre, `0.9` en clair |
| 5 | Les labels **croisaient les bandes bleues** — halo inopérant (ombre sombre = couleur du fond) | moyenne de zone : `[52,55,69]` vs fond `[3,4,5]` | pastille arrondie semi-opaque + bordure fine + police `600` |

## 6. Checklist de validation

- [x] `app/index.html` = **seul fichier modifié** (`+160 −110`, puis `+32 −2`)
- [x] `js/main.js`, `css/style.css`, `app/css/main.css`, 4 simulateurs → **intacts**
- [x] Charte du site appliquée en production : fond `rgb(10,10,26)`, police `Inter`
- [x] 2 boutons « ← Retour au site » → `../app-astro.html` → **HTTP 200**
- [x] 8/8 liens internes/externes testés → **200**
- [x] Contrastes AA dans les **2 thèmes** (titre `h1` : 15.90 sombre / 13.98 clair)
- [x] Modal du guide : ouverture, 7 sections, 24 puces, fermeture, scroll restauré
- [x] Recherche du guide : 1 résultat / 34 masqués
- [x] Canvas : thème sombre ↔ clair → **redessiné** (mesuré, pas supposé)
- [x] 4/4 labels **entièrement dans le canvas** (plus de troncature)
- [x] Aucun identifiant / secret exposé

## 7. Source

- Demande : Christophe, 12/10/2026 (capture `tofdan.be/app/index.html` + verbatim ci-dessus).
- Méthode : harnais `copilot-brief.py` (skill `cli-agents-hermes`), modèle `claude-sonnet-5.5`.
- Vérification : mesures navigateur (`browser_console`, `browser_vision`) + `curl` HTTP.
- Règle appliquée : **le compte-rendu d'un agent n'est pas une preuve** — 5 défauts trouvés
  par la vérification indépendante, dont 3 invisibles au CR de Copilot.