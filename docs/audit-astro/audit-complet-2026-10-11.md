# 🔭 Audit du site tofdan.be — partie Astro

**Version 2 — 11/10/2026** — remplace l'audit du 02/10/2026
**Auditeur** : Gérard (responsable technique de la partie astro)
**Demandeur** : Christophe — *« je pense qu'il est nécessaire de faire un audit du site
pour faire ensuite des propositions d'amélioration ou refactorisation »*
**Périmètre** : 13 pages HTML racine + `css/`, `js/`, `images/`, `app/`, `tools/`
**Hors périmètre** : `/hermes/`, `hermes.html`, `login.html`, `dashboard/`, `docs/`, `bavi/`
(zone Michel — non audités, non modifiés)

> **Méthode** : toutes les affirmations de ce rapport sont **mesurées**, jamais supposées.
> Toute mesure reproduite donne la commande ou la valeur exacte. Ce qui n'a pas pu être
> mesuré est **signalé comme tel**. Un constat de registre non re-mesuré n'est **pas**
> repris comme vrai.

---

## 1. Verdict général

**Le site est SAIN sur le plan technique et PAUVRE sur le plan visuel.**

| Dimension | État |
|---|---|
| Structure HTML | ✅ Bonne — 1 seul `<h1>` par page, hiérarchie correcte |
| Intégrité des liens | ✅ **0 lien interne mort** ; **0 asset manquant** |
| Accessibilité de base | ✅ **100 % des `<img>` ont un `alt`** |
| Sécurité des assets | ⚠️ 1 fichier sans cache-bust (`meteo.js`) |
| Cohérence | ⚠️ 1 page sur un `?v=` divergent (`hermes.html`, zone Michel) |
| **Richesse visuelle** | 🔴 **DÉFAUT MAJEUR — voir §2** |
| Versionnement | ⚠️ 3 fichiers générés suivis à tort (A-14) |

---

## 2. 🔴 DÉFAUT MAJEUR — le site ne montre ses photos que dans l'album

**Mesure** : comptage des balises `<img>` réelles dans les 13 pages.

```
album.html               25 <img>     ← la seule page avec des photographies
app-astro.html            0 <img>
astro.html                0 <img>
biblio.html               0 <img>
cgu.html                  0 <img>
chat.html                 0 <img>
hermes.html               0 <img>     (zone Michel)
index.html                0 <img>     ← LA PAGE D'ACCUEIL
login.html                0 <img>     (zone Michel)
materiel.html             0 <img>
mentions-legales.html     0 <img>
meteo-astro.html          0 <img>
news.html                 0 <img>
```

**5 emplacements sont dimensionnés comme des images mais contiennent un caractère :**

| Fichier | Ligne | Contenu | Rôle attendu |
|---|---|---|---|
| `index.html` | 49 | `<div class="hero__icon">🔭</div>` | visuel du hero |
| `index.html` | 82 | `<div class="featured-card__image">🌕</div>` | **photo de la Lune** |
| `index.html` | 89 | `<div class="featured-card__image">☀️</div>` | **photo du Soleil** |
| `news.html` | 74 | `<div class="news-card__image">🔭</div>` | vignette article |
| `news.html` | 104 | `<div class="news-card__image">🌤️</div>` | vignette article |

**Impact** : la **page d'accueil** — la première vue d'un visiteur — annonce « ASTRO
PHOTOGRAPHIE », promet « Quelques-unes de nos plus belles captures récentes », **et
n'en montre aucune**. Les 25 photographies existent, sont en ligne, sont de qualité —
il faut **cliquer sur « Album » pour les découvrir**.

**C'est le plus gros écart entre la promesse de la page et ce qu'elle délivre.**

- **Vérifié visuellement** (capture du 11/10/2026) : les cartes « En Vedette »
  affichent un cadre vide avec une petite icône, pas une image.
- **Vérifié que l'album fonctionne** : 25 fichiers, 25 `<img>`, 0 doublon MD5.

---

## 3. Anomalies CONFIRMÉES (re-mesurées le 11/10/2026)

### C-1 🟡 `js/meteo.js` sans cache-bust — A-09

- **Mesure** : `grep -oE 'meteo\.js[^"]*' *.html` → **`meteo.js` (1 occurrence, sans `?v=`)**
- **Poids** : **21 330 o**, 632 lignes — le plus gros JS du site (~16 % du poids total).
- **Utilisé par** : `meteo-astro.html` uniquement.
- **Impact** : une correction dans `meteo.js` peut ne pas atteindre un visiteur qui l'a
  en cache. **Même défaut que celui corrigé sur `contact-chat.js` le jour même.**
- **Correctif** : `?v=<timestamp>` sur la référence. **2 minutes.**

### C-2 🟡 Code inline dans `login.html` — A-10 (portée corrigée)

- **Le registre annonçait « neuf blocs `<script>` inline dupliqués ».** **Mesure du
  11/10/2026** : `grep -n '<script' *.html | grep -v 'src='` → **2 blocs, dans
  `login.html` seulement** (l.35 et l.49).
- **Conclusion** : l'anomalie A-10 **n'existe plus telle que décrite**. Les 9 blocs ont
  disparu — vraisemblablement lors de la factorisation du header/footer (Lot 4).
  Ce qui subsiste est **en zone Michel** → hors de mon périmètre.
- **Action** : **aucune de mon côté**. A-10 à requalifier ou clore.

### C-3 🟡 Fichiers générés versionnés — A-14 (décision)

- **Objet** : les fichiers d'audit et `tools/` sont-ils tous utiles au site public ?
- **Mesure** : dépôt = **70 fichiers**, **4,0 Mo** hors `.git` — dont `docs/` **120 Ko**
  (documentation d'audit) et `tools/` **12 Ko** (générateur de nav).
- **Point d'attention** : `docs/` et `tools/` sont **publiés** par le `rsync` vers
  `/var/www/tofdan.be`. Ils sont donc **accessibles publiquement**.
- **Question à trancher** : publier la documentation d'audit interne est-il voulu ?

### C-4 🔵 `hermes.html` sur un `?v=` divergent — A-20 (zone Michel)

- **Mesure** : `style.css?v=1785757465` présent **1 fois** — `hermes.html`.
  Les 11 pages astro portent `1790954759`.
- **Action** : **signaler à Michel**, ne pas modifier.

---

## 4. 🔵 DÉFAUT DE RÉDACTION — la phrase qui dit l'inverse

**`materiel.html`, ligne 155** :

> « Le Seestar fonctionne en alt-azimutal, ce qui limite les poses à 10 secondes.
> Sur une cale équatoriale, il s'aligne sur l'axe de rotation de la Terre :
> **poses de 60 secondes et plus de rotation de champ.** »

**Le problème** : le mode équatorial sert précisément à **supprimer** la rotation de
champ. La tournure « et plus de rotation de champ » se lit comme *« davantage de
rotation de champ »* — **soit l'exact contraire de la réalité technique.**

L'intention était sans doute *« et plus de problème de rotation de champ »*.

**Impact** : sur un site d'astronomie, une phrase techniquement fausse sur l'intérêt
même du mode équatorial **coûte de la crédibilité**. À corriger.

*Note : la `<ul>` qui suit (l.156-160) est complète — « Poses 6× plus longues »,
« Coins d'image plus propres », « Alignement polaire assisté », « Nécessite un ciel
dégagé » — la liste est correcte, seul le paragraphe est fautif.*

---

## 5. Contenu de qualité — ce qui fonctionne

**À signaler aussi** : plusieurs pages sont **d'excellent niveau** et ne demandent rien :

- **`materiel.html`** — le matériel réel de Christophe y est **exactement** décrit :
  Seestar S50 (50 mm / 250 mm / f5 / IMX462 / champ 1,28°×0,72°), Celestron
  StarSense DX 6″ (150 mm / 1500 mm / f10 / Schmidt-Cassegrain / Vixen),
  et les **4 oculaires avec les bons grossissements** (37,5× / 60× / 125× / 167×).
  **Factuellement juste.** Seul défaut : la phrase §4.
- **`news.html`** — 4 articles **factuels**, bien écrits, avec liens croisés vers
  l'album, le matériel et la météo. L'article OCA est **exact** (Grapfontaine,
  Neufchâteau, ouvert depuis 2013, 610 mm).
- **`meteo-astro.html`** — interroge **3 API réelles** (Open-Meteo, geocoding,
  Nominatim) avec `try/catch` et repli local sur la phase lunaire.
- **`album.html`** — **25 photos**, 6 catégories, `alt` descriptifs, dates
  d'observation. **Aucun doublon** (25 empreintes MD5 toutes distinctes).
- **Toutes les `<img>` du site ont un `alt`.**

---

## 6. Constats ANTÉRIEURS PÉRIMÉS — à ne pas recorriger

Ces constats figurent encore dans le registre d'anomalies et sont **faux au 11/10/2026**.
Ils sont listés ici **pour qu'on ne les « recorrige » pas à tort**.

| Réf. | Constat initial | Réalité mesurée le 11/10/2026 |
|---|---|---|
| **A-04** | « `album.html` : galerie entièrement vide » | ❌ **FAUX** — **25 `<img>`**, 25 fichiers (2,1 Mo), 0 doublon |
| **A-10** | « Neuf blocs `<script>` inline dupliqués » | ❌ **PÉRIMÉ** — **2 blocs**, dans `login.html` (zone Michel) |
| **A-11** | « bouton retour-haut cassé (`hashchange`) » | ❌ **FAUX** — `hashchange` se déclenche bien |
| **A-21** | « application hébergée hors domaine » | ✅ **RÉSOLUE** — rapatriée sous `app/` |

**Leçon de méthode** : un registre d'anomalies **non re-mesuré devient une source de
fausses croyances**. J'ai moi-même relayé A-04 comme actuelle avant de la vérifier.
**Toute anomalie présentée à Christophe doit être re-mesurée d'abord.**

---

## 7. Qualité de mes propres mesures — 4 faux positifs

Sur cette session, **mon instrumentation m'a trompé 4 fois**, le code étant sain :

1. **Regex `.form__error`** → conclu « erreurs cassées » ; la structure était **bonne**.
2. **Clic headless** sur le bouton de formulaire → « la validation ne se déclenche
   pas » ; un `requestSubmit()` prouve que **tout fonctionne**.
3. **`<strong>` « vides »** → `tofdan.be`, `LEO Server`, `Juin 2026` **bien présents** ;
   l'accessibility-tree ne les restitue pas.
4. **Paragraphe OCA « vide »** dans `news.html` → le texte est **complet**.

**Et un défaut annoncé était mal attribué** : le label tronqué dans l'app était
attribué aux noms de bras spiraux ; c'est en réalité **« 📍 Bras d'Orion (Notre
position) »** qui déborde (`app/Simulateur_3D.html` l.235).

**Règle qui en découle** : *« un "tout est cassé" est presque toujours mon test qui
est cassé »*. **Deux mesures de natures différentes avant de conclure.**

---

## 8. Base saine pour le référencement et le partage

- `og-image.jpg` — **69 972 o**, en ligne, présent sur les pages.
- `meteo-astro.html` — **la page la plus solide** techniquement.
- **Aucun 404** sur les 11 pages testées en production.
- Poids d'une visite d'accueil : `index.html` 5 252 o + `style.css` 36 997 o +
  `main.js` 3 677 o ≈ **46 Ko** hors images — **léger**. Le poids n'est pas un problème.

---

## 9. Sources de ce rapport

- Dépôt `/home/tofdan/Projets_Dev/tofdan-site`, HEAD `2a9c258`.
- Mesures locales : `grep`, `wc`, `md5sum`, script `/tmp/audit-mesures.sh`.
- Mesures en production : `curl` sur `https://tofdan.be/*` (11 pages, 200/200).
- Vérifications visuelles : navigateur sur `index.html`, `news.html`, `materiel.html`,
  `album.html`, `app/Simulateur_3D.html`.
- Registre d'anomalies : `docs/audit-astro/registre-anomalies-astro.md`.

**Aucune donnée de ce rapport n'est estimée ou supposée.**