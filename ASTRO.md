# Périmètre ASTRO — propriétaire : Gérard (profil gerard)

## ✅ Fichiers sous ma responsabilité (9)
astro.html, app-astro.html, album.html, materiel.html,
meteo-astro.html, news.html, js/meteo.js, css/style.css, js/main.js

## ⛔ INTERDIT — zone Hermes (propriétaire : Michel)
hermes.html, login.html, biblio.html, chat.html
docs/, README.md, robots.txt, sitemap.xml

## ⚠️ Fichiers PARTAGÉS — consultation libre, modification interdite sans accord
index.html   (porte la double identité « deux univers, un seul site »)
cgu.html, mentions-legales.html

## ⚠️ Contrainte connue
Les pages astro contiennent une barre de navigation avec des liens vers
biblio.html et chat.html (zone commune). NE PAS supprimer ces liens :
la navigation inter-univers doit rester fonctionnelle.
Un futur lot (Lot 2) migrera /hermes/ et réécrira ces liens d'un coup.

## Règle de commit

Puisque **1 seul dépôt** est partagé entre Gérard (astro) et Michel (Hermes),
il faut empêcher les collisions :

- Gérard commit **uniquement** des chemins de sa liste ✅
- Sinon `git add` fichier par fichier (jamais `git add -A`)
- Jamais `git push -f`, jamais `git reset`
- Michel et Gérard ne travaillent pas simultanément sur le même fichier
