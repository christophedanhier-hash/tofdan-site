# Proposition — refactorisation de l'écran 1 (accueil / catalogue)

*Proposition seule : aucun fichier du repo n'a été modifié.*

## 1. Diagnostic (confirmé par lecture du code)

1. `.obs-bandeau` (app.css l.753) est un bloc pleine largeur ; `.obs-champs` (l.755) et `.obs-mode` (l.760) sont plafonnés à `max-width: 520px` ⇒ moitié droite vide. Il empile titre, 4 lignes de champs, erreur, 2 radios et une note de 2 lignes (toujours visible).
2. `.accueil` (l.237) = `minmax(220px,300px) 1fr` : la liste `.liste-const` est une colonne unique, `overflow-y:auto` ; 29–49 entrées ⇒ défilement.
3. Chaque `<button class="btn-lien">` contient nom FR + `small` latin·abrév. + `.obs-badge` (texte long « observable · 210 min · 21h00 – 0h30 ») : 3 lignes par entrée, faible densité.
4. Aucun tri/filtre hors des 2 radios (`obs.mode`) ; pas de vue d'ensemble de la saison ni du ciel du soir.
5. Contrainte héritée : en `#ecran.fixe` (l.123-135) l'écran est en hauteur fixe sans défilement de page ; seule la liste défile (`flex:1 1 0; min-height:0`). Les règles `.accueil` partagent aussi le bloc `@media (max-width:820px)` (l.738) avec d'autres écrans.

## 2. Proposition d'agencement

### Variantes (classées)

| Rang | Variante | Avis |
|---|---|---|
| **A (recommandée)** | Barre d'observation fine repliable + **grille de cartes compactes** à gauche (~58 %) + carte « constellation courante » à droite (~42 %) | Meilleur compromis : ~25-30 entrées visibles sans défiler, observabilité en un coup d'œil (pastille couleur), vue courante inchangée. |
| B | Barre fine + liste en 2-3 colonnes de texte (CSS `columns`) | Plus simple, mais l'ordre de lecture suit des colonnes et la pastille est moins lisible. |
| C | Barre fine + grille pleine largeur, figure courante en tiroir/modale | Voit tout, mais casse la vue courante (priorité 3) et ajoute du JS : rejetée. |

### Variante A — structure de haut en bas (desktop)

1. **Barre d'observation** (≈ 6-8 % de la hauteur utile replié ; ≈ 16 % déployé) — pleine largeur, 1 ligne :
   `Observer ce soir` · résumé `📍 Lieu (lat, lon) · date` · `[Observables n] [Toutes N]` (modes en **boutons segmentés** radio visuellement stylés) · `[⚙ Modifier]` (bouton repliable, `aria-expanded`).
   - **Replié** : résumé + modes + bouton. **Déployé** : sous la barre, une ligne de champs en grille `auto-fit` (Lat | Lon | Lieu (2fr) | Date | « Utiliser ma position »), 4-5 colonnes, **100 % de la largeur** (plus de plafond 520 px). La note méthodologique passe en `title`/`<details>` discret à la fin de la zone déployée.
   - État mémorisé dans `localStorage` (clé dédiée `constellations.bandeau`), **déployé par défaut au tout premier lancement ET dès qu'il y a une erreur de coordonnées** (le `role="alert"` doit rester visible).
2. **Zone catalogue** (≈ 92 % → 84 % de la hauteur restante), grille 2 colonnes **58 % / 42 %** :
   - **Gauche (58 %)** : `ul.liste-const` en `display:grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr))`, gap 6 px, défilement interne seul si besoin. À ~900 px de large : 4 colonnes × ~8 lignes visibles ≈ 30 cartes.
   - **Carte compacte (`button.btn-lien`)** : ligne 1 = pastille d'état + nom FR (gras) ; ligne 2 = abréviation IAU (petit) ; ligne 3 optionnelle = durée courte « 210 min » (observable) . Le détail complet (latin, plage horaire) passe dans `title` et `aria-label` du bouton. Le texte badge d'origine est conservé en `.obs-badge` (masqué visuellement hors survol/focus ou réduit) pour lecteurs d'écran.
   - **Pastille** : vert `--obs-ok` (#4ade80 déjà utilisé) = observable ; atténuée = non observable ; ambre (#fbbf24 déjà utilisé) = non calculable. **Ne pas se fier à la couleur seule** : forme/texte (« 210 min », « non obs. », « ? »).
   - **Droite (42 %)** : `.carte-const` inchangée structurellement (entête + figure SVG).
3. **Mobile ≤ 820 px** : 1 colonne ; barre repliée par défaut ; grille en 2 colonnes (`minmax(130px,1fr)`) avec hauteur max ≈ 40 vh puis défilement interne, **carte courante au-dessus** de la grille (ou dessous, voir risque) ; champs déployés en 1-2 colonnes.

## 3. Wireframe ASCII (variante A, desktop, replié)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ OBSERVER CE SOIR  📍 Charleville (49.90, 5.00) · 2026-10-13               │  ~7 %
│ [● Observables 29][ Toutes 49]                              [⚙ Modifier ▾]│
├───────────────────────────────────────────┬──────────────────────────────┤
│ GRILLE (58 %)  ul.liste-const             │ CARTE COURANTE (42 %)        │
│ ┌────────┐┌────────┐┌────────┐┌────────┐  │ ┌──────────────────────────┐ │
│ │●Orion  ││●Taureau││●Cygne  ││○Lion   │  │ │ Orion  Orion (Ori)·Hiver │ │
│ │ Ori    ││ Tau    ││ Cyg    ││ Leo    │  │ │ [Commencer][↻ Reprendre] │ │  ~93 %
│ │ 240min ││ 180min ││ 210min ││ non obs│  │ ├──────────────────────────┤ │
│ └────────┘└────────┘└────────┘└────────┘  │ │                          │ │
│ ┌────────┐┌────────┐┌────────┐┌────────┐  │ │      figure SVG          │ │
│ │ …      ││ …      ││ …      ││ …      │  │ │                          │ │
│ └────────┘└────────┘└────────┘└────────┘  │ └──────────────────────────┘ │
│  (défilement interne seulement si > ~30)  │                              │
└───────────────────────────────────────────┴──────────────────────────────┘
Déployé : une ligne supplémentaire sous la barre
 [Latitude][Longitude][Lieu……………(autocomplétion)][Date][Utiliser ma position]
 (erreur role="alert" sous cette ligne ; note méthodo dans un <details>)
```

## 4. Modifications techniques prévues

### `app/constellations/app.js` (zones autorisées seulement)

**`bandeauObservation(infos, nbObs, nbTotal)` — conservée, signature inchangée.**
- Tout le code d'autocomplétion, géolocalisation, `champ()`, `dt`, `dehors`, `sauverObs()` est **conservé tel quel** (mêmes `id` : `obs-lat`, `obs-lon`, `obs-nom`, `obs-date`, `obs-nom-liste`, `obs-prop-k`, mêmes handlers). Seul l'**assemblage final** (`return el('div', …)`) change.
- `radio()` : conserve `<input type="radio" name="mode-obs">` (clavier natif, flèches) dans un `label.obs-mode` ; styles « segmentés » en CSS uniquement.
- **Ajouts internes** (fonctions locales, pas globales) :
  - `lireBandeauOuvert()` / `ecrireBandeauOuvert(b)` : `try { localStorage… } catch(e){}` avec clé `constellations.bandeau` ; `localStorage` indisponible ⇒ valeur par défaut, état gardé en variable de module locale à la zone (`var bandeauOuvert`, déclarée juste au-dessus de `bandeauObservation`) pour survivre aux `rendre()`.
  - `resume()` : texte « 📍 nom (lat, lon) · date » à partir de `lieuCourant()` (« lieu invalide » sinon).
  - bouton `⚙ Modifier` : `aria-expanded`, `aria-controls="obs-panneau"`, bascule la classe/attribut `hidden` du panneau **sans appeler `rendre()`** (évite de perdre le focus et les saisies en cours), puis écrit l'état.
- **Supprimé** : le `h3` plein-largeur à marge, le `div.obs-champs` plafonné ; la `p.obs-note` est déplacée dans un `<details class="obs-note-d">`.
- Ouverture forcée si `!lieuCourant()` ou `obs.msg` non vide.

**`ecran1()` — structure conservée** (calcul `infos`/`nbObs`, filtrage `obs.mode`, `charger(...)`, `reprise`, `lireProgression`, `aller`).
- Corps du `forEach` : le `button.btn-lien` est reconstruit avec : `span.pastille` (classe `pastille--ok|non|na`, `aria-hidden="true"`), `span.nom` (nom FR), `small` (abréviation seule), `span.obs-badge` raccourci (« 210 min » / « non obs. » / « ? »). Ajout `title` + `aria-label` : « Nom — latin (abrév.) — observable ce soir 210 min, 21h00 – 0h30 ». `aria-current` et `onclick` **inchangés**.
- **Cas liste vide** : si 0 résultat, insérer `li.liste-vide` (« Aucune constellation observable à cette date/lieu. ») + bouton « Afficher toutes » qui fait `obs.mode='toutes'; sauverObs(); rendre();`.
- Le bloc `btns`/`meta`/`.carte-const`/`.fig` est **inchangé**.
- **Aucune** autre fonction ajoutée au périmètre global ; aucune modification de `visibilite()`, `charger`, `rendre`, écrans 2-6.

### `app/constellations/app.css`

- **Modifier** `.accueil` : `grid-template-columns: minmax(0, 58fr) minmax(0, 42fr)` (remplace `minmax(220px,300px) 1fr`) ; `align-items: stretch`.
- **Modifier** `.liste-const` : `display:grid; grid-template-columns: repeat(auto-fill, minmax(150px,1fr)); gap:6px;` garder `overflow-y:auto; align-self:start; max-height:100%`.
- **Modifier** `.liste-const li` / `li:last-child` : retirer `border-bottom` (la bordure passe sur la carte).
- **Modifier** `.btn-lien` : bloc vertical (`flex-direction:column; align-items:flex-start`), `background: var(--color-bg-card); border:1px solid var(--color-border); border-radius: var(--radius-md); padding:6px 8px`, hauteur ~ 3 lignes. `.btn-lien:hover` : `border-color: var(--color-primary)`. `.btn-lien:focus-visible` : `outline:2px solid var(--color-accent); outline-offset:2px` (**à ajouter**). `.btn-lien[aria-current="true"]` : bordure `--color-primary` + fond conservé.
- **Ajouter** `.btn-lien .pastille`, `.pastille--ok|--non|--na` (utilisent les couleurs `.obs-badge--*` existantes) ; `.liste-vide`.
- **Modifier** `.obs-bandeau` : `padding: 6px 12px; margin-bottom:8px;` `display:flex; flex-wrap:wrap; gap:6px 12px; align-items:center` ; fond `var(--color-bg-card)` et bordure `var(--color-border)` (remplace `var(--border, rgba(255,255,255,.15))`, non adapté au thème clair).
- **Modifier** `.obs-bandeau h3` : `margin:0; font-size:.8rem`.
- **Modifier** `.obs-champs` : `grid-template-columns: repeat(auto-fit, minmax(130px,1fr)); flex-basis:100%` ; **supprimer `max-width:520px`**. Labels au-dessus des champs (label/champ regroupés si besoin dans des `div`).
- **Supprimer** `.obs-mode { max-width:520px }` (l.760) ; `.obs-modes` passe en `display:inline-flex; margin:0`; `.obs-mode` = segment (`padding:2px 10px; border:1px solid var(--color-border); border-radius:999px`), `.obs-mode:has(input:checked)` mis en valeur (`--color-primary`) ; `:focus-within` avec outline. Le `input` radio reste focusable (pas de `display:none`).
- **Modifier** `.obs-n` : fond `color-mix(in srgb, var(--color-primary) 25%, transparent)`.
- **Modifier** `.obs-note` → style dans `<details>` ; **modifier** `.obs-badge` (taille .72rem, `display:inline`).
- **Ajouter** `.obs-resume`, `.obs-toggle`, `.obs-panneau[hidden]{display:none}`.
- **Conserver** `.obs-props*`, `.obs-aide`, `.obs-erreur`, `.obs-nom-boite` (autocomplétion).
- **Mobile** : dans le bloc `@media (max-width:820px)` existant, `.accueil` reste `1fr` (déjà en place ; le bloc est partagé, **ne rien y retirer**) ; ajouter dans un **nouveau** bloc media propre au dessous des `.obs-*` : `.liste-const{grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); max-height:40vh}` et `.obs-champs{grid-template-columns:1fr 1fr}`.
- Les règles `#ecran.fixe .accueil/.carte-const` (l.123-135) **restent inchangées** (elles contiennent `.accueil`, donc techniquement dans le périmètre, mais elles fonctionnent déjà).

### `index.html` (rappel, un seul changement sans toucher au reste)
Incrémenter **uniquement** `app.css?v=28` → `?v=29` et `app.js?v=31` → `?v=32`. **Ne pas** toucher à `style.css?v=` ni `main.js?v=`, ni au header (liens `biblio.html`, `chat.html`).

## 5. Analyse de risque

| Risque | Conséquence | Mitigation / vérification |
|---|---|---|
| `localStorage` indisponible / quota / mode privé | Exception | Tous accès dans `try/catch` (comme `sauverObs`) ; état de repli en variable ; test : désactiver le stockage dans DevTools → barre fonctionnelle, déployée par défaut. |
| Lieu sans coordonnées valides (`lieuCourant()===null`) | `visibilite()` reçoit `null` → badges « non calculable » | Barre auto-déployée, `role="alert"` visible, résumé « lieu invalide », pastilles ambre, aucune constellation écartée (comportement actuel conservé). Test : lat `abc`, lon `200`. |
| Constellation sans centre (fiche illisible) | `infos[id]` null | Conservée dans la liste, pastille ambre. Test : bloquer un fichier `data/*.json`. |
| Liste vide (observables, 0 résultat) | Zone vide incompréhensible | `li.liste-vide` + bouton « Afficher toutes ». Test : lieu polaire / date extrême. |
| `rendre()` détruit le DOM à chaque saisie | Perte de focus, bandeau qui se referme | État ouvert/fermé stocké hors DOM ; focus déjà géré par l'existant ; bascule du bandeau sans `rendre()`. Test : taper lieu → choisir proposition → l'état reste. |
| Autocomplétion (`.obs-props`, `position:absolute`) coupée par un `overflow` | Liste invisible | Pas d'`overflow:hidden` sur `.obs-bandeau`/`.obs-panneau`. Test visuel. |
| Hauteur fixe `#ecran.fixe` | Grille qui déborde | `min-height:0` déjà en place ; grille défile en interne. Test à 1366×768 et 1920×1080. |
| Thème clair/sombre | Couleurs en dur illisibles | Variables `--color-*` uniquement ; vérifier les deux thèmes (contraste pastilles). |
| Accessibilité | Régression clavier/lecteur d'écran | Boutons natifs, `aria-current`, `aria-expanded`, `aria-label` complet, `role="alert"` conservé, `focus-visible`, info non portée par la couleur seule. Test Tab/Maj+Tab, flèches sur radios. |
| Mobile | Carte courante repoussée trop bas | Ordre DOM : carte courante visible dès l'écran ; grille limitée à 40 vh. Test 375×667. |
| Régression écrans 2-6 | `.btn-lien`/`.carte-const` réutilisés ? | `grep` des classes modifiées dans `app.js` hors `ecran1` avant édition ; navigation manuelle des 6 écrans après. |
| Géolocalisation / date / reprise | Casse silencieuse | Code conservé verbatim ; tester : bouton position (accepter/refuser), saisie manuelle, changement de date, radios, `↻ Reprendre (étape N)`. |

## 6. Estimation d'effort (étapes vérifiables isolément)

1. **Garde-fou** (15 min) : `grep` d'usage de `.btn-lien`, `.carte-const`, `.obs-*`, `.accueil` hors `ecran1`/`bandeauObservation` ; capture avant. *Vérif : liste d'usages vide hors périmètre.*
2. **CSS grille** (30 min) : `.accueil`, `.liste-const`, `.btn-lien` seuls. *Vérif : ≥ 24 cartes visibles à 1366×768 ; écrans 2-6 identiques.*
3. **Cartes** (30 min) : refonte du contenu de bouton dans `ecran1()`, pastilles, `title`/`aria-label`, état vide. *Vérif : clic charge la constellation, `aria-current`, Reprendre OK, liste vide OK.*
4. **Barre compacte sans repli** (30 min) : nouvel assemblage de `bandeauObservation()`, CSS `.obs-*`, segments de mode. *Vérif : géoloc, saisie manuelle, autocomplétion, date, modes.*
5. **Repli mémorisé** (30 min) : bouton, `aria-expanded`, `localStorage` + repli. *Vérif : rechargement garde l'état ; stockage bloqué ⇒ pas d'erreur console ; erreur de coordonnées ⇒ déployé.*
6. **Responsive & thèmes** (30 min) : media query dédiée. *Vérif : 375, 768, 1366, 1920 px ; clair/sombre.*
7. **Cache-bust + recette finale** (15 min) : `app.css?v=29`, `app.js?v=32` seulement ; parcours des 6 écrans, navigation clavier, header intact. *Vérif : `git diff` limité à `app.js` (2 fonctions), `app.css`, 2 numéros dans `index.html`.*

Total estimé : ≈ 3 h 00.

PROPOSITION PRETE : /tmp/proposition-accueil.md
