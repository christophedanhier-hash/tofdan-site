# Vérification des demandes à Michel — surveillance automatique

**Date de mise en place** : 11 octobre 2026, 21h19 CEST
**Demandeur** : Christophe (« oui », en réponse à « Tu veux que je vérifie
l'avancement auprès de Michel dans un moment ? »)
**Job cron** : `1b9031abd8ce` — `gerard-verif-demandes-michel`

---

## Objet

Surveiller l'aboutissement des deux demandes transmises à Michel le 11/10/2026
à 21h10, sans relancer Michel inutilement (sa session était déjà active).

| # | Demande | Message Hive |
|---|---|---|
| 1 | Exclure `docs/`, `tools/`, `backups/` du rsync de `deploy-tofdan.sh` | `20261011T211017-7f2e5e` |
| 2 | Passer `christophedanhier-hash/Projet-Astro` en privé | `20261011T211505-c765b2` |

---

## État de référence — 11/10/2026 21h16

Empreinte JSON du moniteur (ce à quoi tout changement sera comparé) :

```json
{"ASTRO_md_200_ou_404": "200", "Projet_Astro_private": "False",
 "docs_302_ou_404": "302", "gerard_non_lus": "0",
 "michel_non_lus": "2", "rsync_exclusions": "1",
 "tools_200_ou_404": "200"}
```

### Lecture des champs

| Champ | Valeur initiale | Après action attendue |
|---|---|---|
| `Projet_Astro_private` | `False` | `True` ou `PRIVE_OU_ABSENT` (API 404) |
| `rsync_exclusions` | `1` | `>= 4` (les 3 exclusions + `.git/`) |
| `tools_200_ou_404` | `200` | `404` |
| `ASTRO_md_200_ou_404` | `200` | `404` |
| `docs_302_ou_404` | `302` | `404` (302 = toujours protégé, acceptable) |
| `gerard_non_lus` | `0` | `>= 1` = Michel a répondu |
| `michel_non_lus` | `2` | `0` = Michel a tout classé |

---

## Mécanisme

- **Script moniteur** : `~/.hermes/profiles/gerard/scripts/verif-demandes-michel.py`
  (exécutable, shebang `python3`)
- **Fréquence** : toutes les heures
- **Mode** : moniteur — la sortie du script est hachée octet par octet.
  **Sortie inchangée = tick silencieux, aucun réveil de l'agent.**
  Seul un **changement réel** déclenche un réveil, avec le diff injecté.
- **Livraison** : ce fil Telegram (`origin`)

### Pourquoi un moniteur et pas un simple rapport horaire

Un rapport toutes les heures aurait produit 24 messages « rien de neuf » par
jour. Le moniteur ne parle **que** quand Michel a agi — ou quand une mesure
change d'état.

### Propriété requise du script : déterminisme

Le script n'émet **aucun horodatage** et trie ses clés (`sort_keys=True`).
Vérifié par **deux appels consécutifs identiques** avant mise en service.
Sans cela, chaque tick paraîtrait « changé » et l'agent serait réveillé à vide
toutes les heures.

---

## Piège rencontré à la mise en place

**Le CLI hive sans `--agent` ne lit pas la boîte de l'appelant.**

Première version du moniteur : `gerard_non_lus` affichait `2` — alors que la
boîte de Gérard était **vide** (`gerard/inbox/` ne contenait que `.done/`).
Le CLI retombait en réalité sur la boîte de Michel.

**Correction** : cibler explicitement `--agent gerard`. C'est aussi le piège
n°1 documenté par le hive lui-même (« un mauvais chemin fait croire à une boîte
vide et le message reste bloqué »).

**Leçon** : une mesure qui contredit le disque n'est pas une mesure — c'est un
bug dans l'outil de mesure. Vérifier au disque (`ls inbox/`) avant de conclure.

---

## Chronologie

- **21h10** — 2 messages envoyés à Michel (livraison confirmée au `.sent/`).
- **21h15** — Session Michel active (PID `541205`, démarrée 21h10), message ①
  injecté dans son contexte. **Il travaillait déjà** — d'où la décision de ne
  pas relancer.
- **21h19** — Moniteur mis en place, testé, état de référence figé.
- **21h19** — Test de bout en bout du cron déclenché.

---

## Ce que le cron ne fait pas

- **Il n'écrit pas à Michel** — aucune relance automatique. Le moniteur
  observe ; Christophe décide de la suite.
- **Il ne modifie rien** — lecture seule (API GitHub publique, HTTP sur
  tofdan.be, lecture de la boîte hive, `grep` sur le script de Michel).

---

**Gérard Astro** <gerard@tofdan.be>