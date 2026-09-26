# Rapport d'audit — Zone ASTRO de tofdan.be

**Version** : 1.0
**Date** : 26 septembre 2026
**Auteur** : Gérard (documentation technique) — avec appui GitHub Copilot CLI
**Commit audité** : `87a1f32` — « Restaure la page d'accueil astro sur la racine de tofdan.be »
**Périmètre** : 13 fichiers définis par `ASTRO.md`
**Nature** : audit **lecture seule**. Aucune modification de code n'a été effectuée.

---

## 1. Objectif

Comprendre le code de la zone ASTRO avant toute intervention, identifier les
anomalies, mesurer les risques de modification, et fournir une base de décision
pour les lots de travail suivants.

## 2. Méthode

Trois sources croisées, aucune affirmation non vérifiée :

| Source | Nature | Usage |
|---|---|---|
| **GitHub Copilot CLI** | analyse automatisée, 24 outils shell | couverture large, détection de patterns |
| **Sondes manuelles Gérard** | `grep`, `sha256sum`, `curl` | vérification des affirmations de Copilot |
| **Tests HTTP en direct** | `curl -o /dev/null -w` sur les liens externes | validation des liens sortants |

Copilot a été exécuté avec un jeton OAuth (`gho_...`) fourni par
`COPILOT_GITHUB_TOKEN`, en mode lecture seule. Consommation : 39,28 crédits IA,
2 min 51 s, 932 k tokens.

> **Principe appliqué** : le rapport de Copilot est un **input**, pas une vérité.
> Chaque affirmation a été revérifiée. Les écarts sont documentés en §6.

## 3. Inventaire du périmètre

| Fichier | État | Rôle |
|---|---|---|
| `astro.html` | actif | hub de la zone astro |
| `app-astro.html` | actif | passerelle vers l'application externe |
| `album.html` | **gabarit d'attente** | galerie sans photo réelle |
| `materiel.html` | actif | matériel d'observation (à confirmer) |
| `meteo-astro.html` | **le plus solide** | météo + phase lunaire, API réelles |
| `news.html` | **à confirmer** | actualités datées avr.–juin 2026 |
| `biblio.html` | actif | bibliographie + liens utiles |
| `chat.html` | **gabarit d'attente** | « formulaire en construction » |
| `cgu.html` | **template divergent** | conditions d'utilisation |
| `mentions-legales.html` | **template divergent** | mentions légales |
| `css/style.css` | 33 Ko, partagé | feuille de style unique |
| `js/main.js` | 119 lignes, partagé | guetteur de DOM |
| `js/meteo.js` | 21 Ko | logique météo/lunaire |

## 4. Constats vérifiés

### 4.1 Architecture — deux gabarits de navbar coexistent

- **8 pages** utilisent `<nav class="nav">` + `.nav__list` + burger mobile + bouton thème :
  `astro`, `app-astro`, `album`, `materiel`, `meteo-astro`, `news`, `biblio`, `chat`.
  9 liens identiques, ordre identique.
- **2 pages** — `cgu.html` et `mentions-legales.html` — utilisent un gabarit
  abandonné `<nav class="header__nav">`, avec **5 liens seulement**, dont un lien
  vers `hermes.html` (hors zone astro).

### 4.2 Bug CSS réel — navbar non stylée

`css/style.css` contient **0 occurrence** des classes `.header__nav` et
`.header__nav-link`. Les navbars de `cgu.html` et `mentions-legales.html` ne sont
donc stylées par aucune règle dédiée : elles héritent du style navigateur par
défaut. **C'est l'anomalie la plus visible pour un visiteur.**

### 4.3 Assets et cache-bust

- `css/style.css?v=1785757465` — **identique sur les 10 pages**. Cohérent.
- `js/main.js?v=1785752541` — sur les 8 pages standard.
- `js/main.js` — **absent de `cgu.html` et `mentions-legales.html`** :
  pas de thème jour/nuit, pas de menu mobile sur ces deux pages.
- `js/meteo.js` — chargé **sans paramètre de cache-bust**, contrairement à `main.js`.
- `index.html` — charge `css/style.css` et `js/main.js` **sans aucun `?v=`**.
  Seule page dans ce cas.

### 4.4 `og:image` cassé

`cgu.html` déclare `og:image` → `https://tofdan.be/og-image.jpg`.
**Ce fichier n'existe pas dans le dépôt** (recherche `find` négative).
Conséquence : aperçu social sans image.

### 4.5 Code mort

`js/main.js` contient une logique de validation de formulaire ciblant
`#contact-form`, `#name`, `#email`, `#message`, `#form-success`.
**Aucun élément correspondant n'existe dans aucune page du périmètre.**
`chat.html` affiche « formulaire en construction » sans balise `<form>`.

### 4.6 Contenu factice ou non vérifiable

- `album.html` — galerie composée **exclusivement** de
  `<div class="gallery__placeholder">` avec emoji (🌕 🌓 🌑) et légendes
  génériques. **Zéro photo réelle.** Aucune balise `<img>` dans toute la zone.
- `news.html` — 3 articles datés **avril / mai / juin 2026**, donc antérieurs à
  la date d'audit (26/09/2026). Contenu rédactionnel plausible, sans photo ni
  lien externe vérifiable. **Statut réel non vérifiable** → marqué lacune.
- `materiel.html` — spécifications (SkyWatcher 200/1000 PDS sur EQ6-R Pro,
  Maksutov 127/1500, lunette 80/600 ED) techniquement cohérentes.
  **Possession réelle des instruments non vérifiable** → marqué lacune.

### 4.7 Lien externe mort — **découverte non détectée par Copilot**

`biblio.html` pointe la Société Astronomique de Liège vers
`https://www.sal.ulg.ac.be/` : **résolution DNS impossible, HTTP 000**.
L'URL correcte est `https://www.societeastronomique.uliege.be/` — **HTTP 200**
vérifié. L'ancien domaine n'est plus servi.

### 4.8 Liens externes sains (vérifiés en direct)

| Lien | Code HTTP |
|---|---|
| `nighttime-imaging.eu` | 200 |
| `siril.org/fr` | 200 |
| `stellarium.org/fr` | 200 |
| `heavens-above.com` | 200 |
| `lightpollutionmap.info` | 200 |
| `sharpcap.co.uk` | 200 |
| `societeastronomique.uliege.be` (corrigée) | 200 |
| `sal.ulg.ac.be` (actuelle, **cassée**) | 000 |
| App externe `Projet-Astro/www/index.html` | 200 |

### 4.9 Duplication structurelle

Le bloc `<header>` + `<nav>` (~26 lignes) est dupliqué à l'identique dans
8 fichiers, **sans aucun système de template ou d'include**. C'est la **cause
racine** de la dérive constatée sur `cgu.html` / `mentions-legales.html` :
toute évolution de navigation doit être répétée 8 fois.

### 4.10 `meteo-astro.html` — page la plus robuste

Logique JS complète, appuyée sur 3 API externes réelles :
`api.open-meteo.com`, `geocoding-api.open-meteo.com`, `nominatim.openstreetmap.org`.
Gestion d'erreur présente (`try/catch`, message utilisateur, **repli sur un
calcul local de la phase lunaire**). C'est la page la plus fiable de la zone.

## 5. Faux positifs de Copilot — écartés après vérification

| Affirmation | Vérification | Verdict |
|---|---|---|
| « `js/main.js` contient du code mort de validation de formulaire » | Vrai sur le fond : le code cible `#contact-form`, inexistant | ✅ retenu |
| « `main.js` gère le thème jour/nuit » | **`.main.js` ne touche pas au thème.** La logique de thème (`classList.toggle('dark')`, `localStorage`) est **inline en fin de `<body>`** dans les pages | ❌ **écarté** |
| « le bouton retour-haut de `main.js` ne fonctionne pas (`hashchange`) » | `hashchange` **ne peut jamais** se déclencher depuis un `<a href="#...">` — l'affirmation est inexacte | ❌ **écarté** |

**Conséquence importante** : le risque réel n'est pas celui décrit. Il y a
**9 blocs `<script>` inline distincts et dupliqués** dans les pages, en plus de
`main.js`. Le risque est donc **plus dispersé** que ce que Copilot annonçait :
modifier le comportement du thème implique de toucher chaque page
individuellement, pas un seul fichier.

## 6. Risques en cas de modification

1. **`js/main.js` partagé par 8 à 10 pages** → toute modification de sélecteur
   casse simultanément menu mobile et éléments communs sur toute la zone.
2. **`css/style.css` unique (33 Ko) et partagé** → une classe renommée impacte
   toutes les pages d'un coup. Aucune séparation par page.
3. **Cache-bust manuel** → toute mise à jour de `style.css` ou `main.js` doit
   être répercutée dans 8 à 10 fichiers HTML. Oubli **probable** : l'écart
   existe déjà (`index.html` sans `?v=`, `meteo.js` jamais versionné).
4. **`meteo-astro.html` dépend de 3 API externes** sans clé ni quota visible.
   Un changement de format de réponse d'Open-Meteo casserait
   `processOpenMeteo()` sans autre signal qu'un message d'erreur générique.
5. **Toucher `cgu.html` / `mentions-legales.html`** implique de retirer le lien
   `hermes.html` → **changement cross-zone** nécessitant validation côté LEO.

## 7. Lacunes déclarées

Points **non vérifiables** avec les moyens disponibles, marqués comme tels
plutôt qu'estimés :

- **L1** — `news.html` : réalité des événements décrits.
- **L2** — `materiel.html` : possession effective des instruments.
- **L3** — `cgu.html` / `mentions-legales.html` : conformité juridique.
- **L4** — Rendu visuel mobile réel de la zone (non testé sans navigateur).
- **L5** — `album.html` : nature des photos prévues.

## 8. Décisions actées

- **Lot 0** = audit documentaire uniquement. Aucune modification. ✅
- **`album.html`** : Christophe fournira les photos, à intégrer en album réel.
- **`hermes.html`** : le lien depuis `cgu.html` / `mentions-legales.html` est
  **conservé** pendant la période de transition.

## 9. Source

- Audit Copilot brut : `~/.hermes/profiles/gerard/working/copilot-audit-astro.md`
- Script d'appel : `~/.hermes/profiles/gerard/scripts/copilot-audit-astro.py`
- Registre des anomalies : `registre-anomalies-astro.md`
- Périmètre de référence : `ASTRO.md` (commit `7bed8af`)