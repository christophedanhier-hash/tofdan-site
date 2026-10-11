# Livraison — 4 chantiers d'amélioration du site astro

**Date** : 11 octobre 2026
**Décision** : Christophe — « les 4 point sont nécessaire pour améliorer le site » / « Go fusion »
**Orchestration** : Gérard (cadrage, vérification, preuve)
**Développement** : Copilot CLI, modèle `claude-sonnet-5.5`, dans le dépôt
**Commit final** : `85a6109` — déployé et vérifié en production

### ✅ Validation Christophe — 11/10/2026, 21h06 CEST

> « je valide, je viens de parcourir le site »

**Validation faite sur le site en production lui-même**, après parcours réel des pages
— et non sur le rapport de livraison. C'est la validation qui compte : l'utilisateur
a vu le résultat de ses yeux.

---

## Résultat

Les 4 chantiers sont **fusionnés dans `main`, poussés et déployés**, puis vérifiés
**en production sur tofdan.be** :

| Chantier | Correctif | Commit | Vérification |
|---|---|---|---|
| ④ `index.html` | favicon + polices Google + bouton de thème | `bdd3d91` | bascule clair/sombre OK, persistance `localStorage` OK |
| ② Contraste WCAG | surcharge `:root:not([data-theme="light"])` | `78afff8` | 4.98:1 / 5.04:1 (sombre), 6.01:1 / 5.45:1 (clair) |
| ① Photos à la surface | 2 photos accueil + 1 news | `fcc909b` | photos réelles visibles, aucun débordement |
| ③ Textures planètes | 6 fichiers dans `app/assets/textures/` | `47aa49d` | Terre texturée : continents, océans, jour/nuit |

**Contrôles finaux en production** : 11/11 pages en HTTP 200 · 9/9 assets en 200 ·
0 bandeau « en construction » · `main.js` versionné 12/12 · 1 seul `<h1>` par page ·
25 images dans l'album (inchangé) · navigation inter-univers intacte.

---

## Ce que Copilot a corrigé dans mes briefs

**Trois fois Copilot a eu raison contre mon cadrage** — chaque fois vérifié par mesure :

1. **Position du bouton de thème** : mon brief disait « dans le `<header>` ». Faux :
   il est placé **après `</footer>`**, comme sur les 11 autres pages. Copilot a
   vérifié la réalité au lieu d'obéir.
2. **Version de `main.js`** : mon brief indiquait `?v=1790954759` (valeur de
   `style.css`). La valeur réelle des 11 pages est `1785752541`. Copilot l'a
   signalé ; j'ai aligné sur la majorité.
3. **Ratios du thème clair** : j'annonçais 6.85/6.05 (fond `#ffffff` supposé).
   Les vraies valeurs sont **6.01/5.45** (fond réel `#f8fafc`). Copilot avait raison.

**Deux fois Copilot a refusé de forcer** là où mon brief décrivait mal la réalité :
le hero (`hero__icon` est une icône décorative, pas un conteneur d'image) et
`news.html` (aucune photo disponible pour 2 des 4 articles). **Il n'a rien inventé.**

**Une prédiction erronée** : il annonçait un débordement d'image (conteneurs supposés
16/9). Mesure réelle : conteneurs **carrés 546×546**, photos 800×800 → aucun
débordement. L'aspect carré de l'album tombait juste.

---

## Erreurs détectées et corrigées

- **`index.html` n'avait AUCUN `?v=` sur `main.js`** — mon audit v2 affirmait à tort
  « cohérent 11/11 pages ». Corrigé : 12/12 alignés.
- **`news.html` oublié au 1ᵉʳ retrait du bandeau** (session précédente) — détecté
  **uniquement par vérification en production**.
- **`backups/` (904 Ko, 10 fichiers) n'était pas dans `.gitignore`** et n'était pas
  suivi : ajouté au `.gitignore` pour ne pas polluer le dépôt public.
- **Textures fournies par Gérard** : Copilot n'a pas pu copier les fichiers (source
  hors dépôt, bac à sable refuse) — **il l'a signalé honnêtement, sans contourner**.

---

## Sources et licences des textures

- `earth_day.jpg`, `earth_normal.jpg`, `earth_specular.jpg`, `earth_night.png` :
  dépôt officiel **`mrdoob/three.js`** (`examples/textures/planets/`), libres d'usage.
- `moon.jpg`, `mars.jpg` : **Solar System Scope** (CC BY 4.0, attribution).
- Redimensionnées en **1024×512** (format équirectangulaire 2:1), 788 Ko au total.

**Note** : deux URL de textures « normales/spéculaires » que j'avais envisagées
étaient **fausses** — le serveur renvoyait sa page d'erreur HTML. Détecté par
vérification `file` avant usage, puis sources réelles trouvées dans `three.js`.

---

## Leçon de méthode

**Le compte-rendu d'un agent n'est pas une preuve.** Trois des quatre runs Copilot
ont annoncé `Changes +0 -0` alors que le travail était fait (`+7 -1`, `+9 -3`, etc.).
Le code était bon ; le rapport était faux. **Seule la mesure tranche.**

**Un cadrage faux produit un correctif faux.** Les trois corrections de Copilot
portaient toutes sur des erreurs de mon brief, pas sur sa compréhension. Vérifier
le brief avant de le déléguer est aussi important que vérifier le résultat.

---

## Reste ouvert

- **A-09** : `js/meteo.js` sans `?v=` — correctif simple, non appliqué.
- **`materiel.html:155`** : phrase du mode équatorial inversée — non corrigée.
- **`docs/` et `tools/` publiés par le rsync** : accessibles sur tofdan.be. Décision
  de les exclure du déploiement à trancher (Christophe / Michel).
- Cul-de-sac de l'app (`link "🏠 Accueil"` → dans l'app), `<button>` imbriqué dans
  `<a>`, `user-scalable=no` ×4, User-Agent `github.io` dans `meteo.js`.
- 25 photos de l'album toutes en 800×800 — recadrage voulu ?

---

**Gérard Astro** <gerard@tofdan.be> — mémoire technique du T600 et du site astro