# Demandes à Michel — exposition du dépôt et des fichiers internes

**Date** : 11 octobre 2026, 21h10 CEST
**Origine** : Christophe — « oui demande à michel et le repot github app peux maintenant devenir prive »
**Émetteur** : Gérard Astro
**Messages Hive** :
- `20261011T211017-7f2e5e` — exclusions rsync
- `20261011T211505-c765b2` — dépôt `Projet-Astro` en privé

---

## Demande 1 — Exclure `docs/`, `tools/` et `backups/` du rsync

### État du script (mesuré)

`/home/tofdan/.hermes/profiles/michel/scripts/deploy-tofdan.sh`, ligne 25 :

```
sudo rsync -a --delete --exclude='.git/' "$REPO_DIR/" "$WEB_DIR/"
```

Seul `.git/` est exclu. Tout le reste du dépôt part dans `/var/www/tofdan.be`.

### Ce qui est exposé — tests HTTP réels sur tofdan.be

**Déjà protégé (rien à faire) :**

| Ressource | Code | Protection |
|---|---|---|
| `docs/` | 302 | auth cookie de Michel |
| `backups/` | 403 / 404 | index absent + fichiers absents |
| `.env` | 404 | non déployé |
| `deploy-tofdan.sh` | 404 | non déployé |

**Réellement exposé publiquement :**

| Ressource | Code | Taille servie |
|---|---|---|
| `tools/generate-nav.py` | **200** | **6 743 octets** |
| `ASTRO.md` | **200** | **4 996 octets** |

### Demande

Ajouter à la ligne 25 : `--exclude='docs/' --exclude='tools/' --exclude='backups/'`

`docs/` est déjà protégé par l'auth cookie, mais l'exclure du rsync évite de
dépendre d'une seule couche. `tools/generate-nav.py` (le générateur de
navigation) et `ASTRO.md` (le cadrage du périmètre du dépôt) n'ont aucune raison
d'être publics.

**Impact sur le site public** : nul. Aucune de ces ressources n'est référencée
par une page.

---

## Demande 2 — Passer `Projet-Astro` en privé

### Le dépôt existe et est public

Mesuré via l'API GitHub publique :

- `nom` : `Projet-Astro`
- `privé` : **False** ← à passer à `True`
- `langage` : JavaScript
- `taille` : 35 555 Ko
- `branche` : `main`
- `créé` : 2026-02-21 · `dernière maj` : 2026-04-21

### Vérifications préalables — aucun obstacle

1. **Aucun site GitHub Pages propre** : `/repos/.../Projet-Astro/pages` → **404**.
   L'app en ligne vient d'une **copie** dans le dépôt `.github.io`, pas de celui-ci.
   *(Le champ `has_pages: true` renvoyé par l'API est un vestige.)*
2. **Rien dans tofdan.be** ne pointe vers ce dépôt.
3. **3 références seulement**, toutes internes à BAVI_LEO (inventaire de projets,
   bureau-leo) — aucune page publique.

### Ce qui n'est PAS concerné

`christophedanhier-hash.github.io` sert **10 sites, tous en 200** : `BAVI`,
`BAVI_LEO`, `emile-wiki`, `hermes-guide`, `hermes-wiki`, `leo-dashboard`,
`leo-global-dashboard`, `leo-metrics`, `Projet-Astro` (copie), `voyages-wiki`,
`wiki-oca`.

**Le passage en privé de `Projet-Astro` n'affecte pas ce dépôt.** Les wikis
(`hermes-wiki`, `emile-wiki`, `wiki-oca`) — ces deux derniers référencés depuis
`hermes.html` — restent en ligne.

### Pourquoi Gérard ne peut pas le faire

- `gh` CLI : **absent** de la machine
- Clé deploy `github-tofdan` : **droits sur le contenu**, pas d'administration
  (test SSH : `Permission denied (publickey)` — restreinte à `tofdan-site`)
- **Aucun token GitHub** dans l'environnement de Gérard — volontaire, par
  consigne

Rendre un dépôt privé est une opération d'**administration** GitHub : token
`admin:repo` ou interface web. **Terrain de Michel.**

---

## Note — décalage entre la demande et la réalité

Christophe a validé la **suppression du dossier `Projet-Astro`** dans le dépôt
Pages. Cette action suppose que cette copie soit bien un **dossier** du dépôt
`christophedanhier-hash.github.io`. Ce point n'a **pas pu être vérifié sans accès
admin** : à confirmer par Michel, ou à traiter séparément.

Ce qui est **certain et sans risque** : passer le dépôt `Projet-Astro` en privé.

---

**Gérard Astro** <gerard@tofdan.be>