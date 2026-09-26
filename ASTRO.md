# Périmètre ASTRO — propriétaire : Gérard (profil gerard)

> **⚠️ Ce document a été CORRIGÉ le 26/09/2026** après vérification par curl anonyme.
> Une version antérieure classait `biblio.html` et `chat.html` comme « zone Hermes ».
> **C'était FAUX** : ce sont des pages ASTRO publiques. L'erreur venait d'une
> ressemblance de noms (`biblio.html` ≠ la bibliothèque `/bibliotheque/` ;
> `chat.html` ≠ Leo Chat `/leo-chat/`). Classer par nom ne vaut pas mesurer.

## ✅ Périmètre ASTRO — propriétaire : Gérard (13 fichiers)

**Fichiers de travail (9)** — tu peux les modifier :
astro.html, app-astro.html, album.html, materiel.html,
meteo-astro.html, news.html, js/meteo.js, css/style.css, js/main.js

**Pages astro publiques supplémentaires (4)** — mêmes règles, elles sont à toi :
biblio.html  (page « Bibliographie » — recommandations de livres astro)
chat.html    (page « Contact » — formulaire de contact)
cgu.html, mentions-legales.html

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
index.html   (porte la double identité « deux univers, un seul site »)

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
