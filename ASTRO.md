# Périmètre ASTRO — propriétaire : Gérard (profil gerard)

> **⚠️ Ce document a été CORRIGÉ le 26/09/2026** après vérification par curl anonyme.
> Une version antérieure classait `biblio.html` et `chat.html` comme « zone Hermes ».
> **C'était FAUX** : ce sont des pages ASTRO publiques. L'erreur venait d'une
> ressemblance de noms (`biblio.html` ≠ la bibliothèque `/bibliotheque/` ;
> `chat.html` ≠ Leo Chat `/leo-chat/`). Classer par nom ne vaut pas mesurer.

## ✅ Périmètre ASTRO — propriétaire : Gérard (11 pages + 4 assets + 2 outils)

**Pages HTML (11)** — tu peux les modifier :
astro.html, app-astro.html, album.html, materiel.html, meteo-astro.html, news.html,
index.html, biblio.html, chat.html, cgu.html, mentions-legales.html

**Assets (4)** : js/meteo.js, css/style.css, js/main.js, og-image.jpg

**Outils (2)** — ajoutés le 02/10/2026 :
tools/generate-nav.py  (génère header/footer uniques pour les 11 pages)
app/                   (Application Astro rapatriée sous le domaine — 10 fichiers, 1,5 Mo)

> **NOTE du 02/10/2026** — `app/` (ex-`Projet-Astro` sur GitHub Pages de Christophe)
> a été rapatriée sous `tofdan.be/app/`. Le lien de `app-astro.html` pointe désormais
> en relatif (`app/index.html`) : **plus aucune dépendance à un domaine tiers.**
> L'app est autonome (Three.js embarqué, 0 CDN).

> Vérifié le 26/09/2026 par `curl` anonyme depuis Internet :
> `biblio.html` → 200 `Bibliographie — Tofdan`
> `chat.html`   → 200 `Contact — Tofdan`
> Toutes deux portent la barre de navigation astro et la mention
> « Site en construction — Création Juin 2026 ». Aucune n'est protégée
> par cookie, et c'est NORMAL : ce sont des pages publiques.

## ⛔ INTERDIT — zone Hermes (propriétaire : Michel)

**Nommément (vérifié : répondent 302 en anonyme, donc bien protégées) :**
hermes.html, login.html

**Zones entières protégées par cookie `hermes_auth` (302 en anonyme) :**
`/dashboard/`, `/docs/`, `/bavi/`, `/leo-chat/`, `/voyages/`, `/dsh-go/`
`/bibliotheque/` (service séparé, OIDC applicatif propre)
`/emile/` (401 — auth distincte)
Infrastructure : `docs/`, `README.md`, `robots.txt`, `sitemap.xml`

> ⚠️ **PIÈGE DE NOMMAGE — à connaître pour ne pas refaire l'erreur :**
> | Fichier public astro | NE PAS confondre avec |
> |---|---|
> | `biblio.html` (page astro) | `/bibliotheque/` (service, port 8772, OIDC) |
> | `chat.html` (page contact) | `/leo-chat/` (app protégée par cookie) |
> | `astro.html` (ton hub) | `/hermes.html` (portail Hermes protégé) |

## ⚠️ Fichiers PARTAGÉS — consultation libre, modification interdite sans accord

> **⚠️ CORRIGÉ le 02/10/2026 par Gérard, sur clarification explicite de Christophe.**
> `index.html` était listé ici comme « partagé ». **C'EST FAUX.**
> Christophe : « *Toi Gérard tu es en responsabilité du site tofdan.be sur le sujet
> astro, et Hermes est dans les mains de Michel. Il y a un DNS tofdan.be avec
> plusieurs propriétaires, et toi tu joues sur l'astronomie.* »
> **`index.html` = racine servie par nginx = page ASTRO, propriété de Gérard.**
> Hermes vit dans ses propres chemins (`/hermes/`, `/dashboard/`, `/docs/`,
> `/bavi/`, `/leo-chat/`, `/voyages/`, `/emile/`) — **aucun recouvrement d'octets.**

**Aucun fichier partagé restant.** Les 13 fichiers de la liste + `index.html`
= 14 fichiers sous responsabilité astro.

## 🔒 RÈGLE D'OR — ne plus jamais éditer un header à la main

Depuis le 02/10/2026, les **11 pages** partagent **un header et un footer uniques**,
générés par `tools/generate-nav.py`.

**Pour modifier la navigation (ajouter un lien, changer le logo…) :**
1. Éditer le modèle dans `tools/generate-nav.py` (constantes `HEADER` / `FOOTER`)
2. Lancer `python3 tools/generate-nav.py` → **dry-run** (montre ce qui changerait)
3. Relancer avec `--apply` → écrit + crée des `.bak-<horodatage>` (ignorés par git)
4. Vérifier : `git diff` ne doit toucher QUE header/footer

**NE JAMAIS** éditer `<header>` ou `<footer>` directement dans une page :
la prochaine génération écraserait la modification, et la divergence reviendrait.

Le script refuse de toucher une page où `<header>`/`<footer>` n'est pas unique
(elle est SIGNALÉE, non modifiée) et ne touche **jamais** la zone Hermes.

## ⚠️ Contrainte connue
Les pages astro contiennent une barre de navigation avec des liens vers
biblio.html et chat.html. NE PAS supprimer ces liens : la navigation
inter-univers doit rester fonctionnelle.
Un futur lot (Lot 2) migrera /hermes/ et réécrira ces liens d'un coup.

## Règle de commit

Puisque **1 seul dépôt** est partagé entre Gérard (astro) et Michel (Hermes),
il faut empêcher les collisions :

- Gérard commit **uniquement** des chemins de sa liste ✅
- Sinon `git add` fichier par fichier (jamais `git add -A`)
- Jamais `git push -f`, jamais `git reset`
- Michel et Gérard ne travaillent pas simultanément sur le même fichier
