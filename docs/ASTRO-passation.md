# Note de passation — périmètre ASTRO (à l'attention de Gérard)

## Où est le dépôt

`/home/tofdan/Projets_Dev/tofdan-site` — remote `git@github-tofdan:christophedanhier-hash/tofdan-site.git`,
branche `main`.

Ton périmètre exact (fichiers autorisés / interdits / partagés) est décrit dans `ASTRO.md`
à la racine du dépôt. Lis-le avant toute modification.

## Comment déployer

Le déploiement est **automatique**, pas manuel : un cron (`3e2d60452b95`,
« 🔄 Déploiement auto tofdan.be », `0 */4 * * *`, soit **toutes les 4 h**) exécute
`run-deploy-tofdan.sh`, qui appelle `deploy-tofdan.sh` :

1. `git pull` sur le dépôt
2. `rsync --delete` vers `/var/www/tofdan.be`
3. `chmod` des fichiers déployés

## ⚠️ Le piège `rsync --delete`

`rsync --delete` synchronise le serveur **exactement** sur l'état du dépôt.
**Toute page présente sur le serveur mais absente du dépôt (ou juste committée en local
et non poussée) sera effacée** à la prochaine passe du cron.

→ Conséquence pratique : **ne jamais laisser un commit local non poussé**.
Toujours `git commit` **ET** `git push` avant la prochaine fenêtre de 4 h,
sinon ton travail (ou pire, une page existante) peut disparaître du site en ligne.

## ⚠️ Ne pas toucher

- `/etc/nginx/sites-enabled/tofdan.be` (config serveur, propriétaire Michel)
- `deploy-tofdan.sh` / `run-deploy-tofdan.sh`
- Tout fichier hors de ta liste dans `ASTRO.md` (zone Hermes, docs, README, etc.)

## Comment vérifier ton travail

Après déploiement, contrôle qu'une page astro répond bien en HTTP 200 :

```bash
curl -s -o /dev/null -w '%{http_code}' https://www.tofdan.be/astro.html
```

Un code `200` confirme que la page est en ligne et accessible.
