# 📓 CHANGELOG Dev — tofdan-site

Journal de développement du site www.tofdan.be. Chaque entrée documente une itération : quoi, pourquoi, comment, qui, coût.

## 2026-08-03 — Document d'architecture (2e chantier doc délégué à Copilot)

**Contexte :** Suite de la séquence documentaire (audit → architecture). 2e test de délégation documentaire à Copilot CLI.

**Réalisé par :** Copilot CLI (production) + LEO (brief, vérification) + Christophe (validation)

**Livrable :** `docs/architecture-2026-08.md` (391 lignes, 23.5 Ko)

**Contenu :**
- §1 Vue d'ensemble : diagramme ASCII des 2 volets (Astro public / Hermes privé)
- §2 **10 décisions ADR** (ADR-001 à 010) : statique pur, HTML dupliqué, CSS BEM, JS ES5, thème data-theme, cache-busting, Google Fonts link, auth client (choix assumé), Open-Meteo, déploiement git
- §3 Composants (3 couches + météo avec fonctions réelles)
- §4 Flux de données (4 flux)
- §5 Sécurité (frontière nginx, M1 documenté, XSS)
- §6 Performance (poids réels 146 Ko total)
- §7 Roadmap : Option A (statique, recommandée) vs Option B (migration Astro)
- Annexe : vérification de cohérence avec l'audit

**Qualité vérifiée par LEO :** fonctions citées réelles (`calcMoonPhase`, `fetchWeather`, `saveRecent`), clés réelles (`THEME_KEY`, `LS_KEY`), poids exacts (wc -c), cohérence audit (R2-R5 = FAIT, M1 = choix).

**Coût :** 39.2 AI credits (3 min 0 s).

**Vérification :** structure 7 sections + annexe, ADR justifiés avec alternatives, 0 contradiction avec l'audit. Commit `5a23b2e`.

**État :** ✅ Livré et déployé

---

## 2026-08-03 — Corrections recommandations audit (R2-R5) — via Copilot CLI

**Contexte :** Suite de l'audit technique août 2026 (produit par Copilot CLI). Application des recommandations 2 à 5.

**Réalisé par :** Copilot CLI (exécution) + LEO (brief, vérification, déploiement) + Christophe (choix)

**Modifications (14 fichiers modifiés, 2 créés) :**
- **R2** : `mentions-legales.html` + `cgu.html` créés (obligation légale BE/UE) ; footers des 10 pages corrigés (0 lien `#` restant)
- **R3** : 4 liens "Lire la suite" de `news.html` → ancres internes `news.html#article-N`
- **R4** : `sitemap.xml` mis à jour (hermes, login, mentions, cgu + dates 2026-08-03)
- **R5** : `@import` Google Fonts supprimé de `style.css` → `<link rel="stylesheet">` dans les 10 `<head>`

**Décisions :**
- **R1 (password en clair) : REFUSÉE — choix assumé par Christophe** — l'auth nginx est le vrai rempart, le password client est volontaire
- Copilot a commité localement (vérifié avant push par LEO)

**Coût :** 47.1 AI credits (2 min 48 s).

**Vérification :** pages légales 200, 0 erreur console (Playwright), footers corrigés, login intact, sitemap live à jour. Commit `d3f7d10`.

**État :** ✅ Livré et déployé

---

## 2026-08-03 — Audit technique août 2026 (premier chantier doc délégué à Copilot)

**Contexte :** Premier test de délégation documentaire à Copilot CLI (workflow gouvernance Hermes × Copilot).

**Réalisé par :** Copilot CLI (production) + LEO (brief, vérification) + Christophe (validation)

**Livrable :** `docs/audit-2026-08.md` (258 lignes) — succède à `audit-2026-06.md`

**Découvertes clés :** faille login (password en clair — REFUSÉE/choix), pages légales manquantes, liens morts, sitemap obsolète, @import render-blocking.

**Coût :** 45.3 AI credits (2 min 43 s).

**Vérification :** tailles réelles exactes (wc -l), faille M1 confirmée dans le code, 9 sections conformes au brief. Commit `005c404`.

**État :** ✅ Livré (les corrections R2-R5 font l'objet de l'entrée suivante)

---

## 2026-08-03 — POC Copilot CLI : optimisation SEO (première délégation)

**Contexte :** Intégration de GitHub Copilot CLI dans l'écosystème LEO (orchestration par LEO/Michel). Ce chantier sert de POC pour valider le workflow : brief → exécution Copilot → vérification LEO → déploiement.

**Réalisé par :** Copilot CLI (exécution) + LEO (brief, vérification, déploiement)

**Modifications (11 fichiers, +119 lignes) :**
- **Open Graph tags** (toutes les 11 pages HTML) : og:title, og:description, og:type, og:url, og:image
- **Favicon SVG inline** (croissant violet `#7c3aed` sur fond `#0a0a1a`) + `<link rel="icon">` sur 11 pages
- **JSON-LD structured data** (WebSite + Organization) — uniquement `index.html`
- **Preload/preconnect** Google Fonts — sur toutes les pages avec style.css (login.html exclue : police système)
- `font-display: swap` — déjà actif via `display=swap` dans l'URL Google Fonts (aucune action nécessaire)

**Décisions/constats :**
- Aucune `<img>` statique dans le HTML → `loading="lazy"` et alt text non applicables (galerie injectée par JS si elle existe)
- `og:image` pointe vers `https://tofdan.be/og-image.jpg` — **placeholder, image à créer** (1200×630)

**Coût :** 42.1 AI credits (2 min 11 s) — raisonnable pour 11 fichiers.

**Vérification :** pages rendues sans erreur console (accueil, astro, hermes), 200 sur le site live, JSON-LD valide (parsing), repos dev = deploy synchronisés (commit `8ace0cd`).

**État :** ✅ Livré et déployé

---

## 2026-08-03 — Nettoyage fichiers .bak

**Contexte :** 13 fichiers `.bak-20260803-1204` obsolètes (versions pré-cache-bust) étaient suivis dans git ET servis publiquement.

**Action :** suppression des 13 fichiers + commit + déploiement.

**Vérification :** 404 sur les .bak, 200 sur toutes les pages normales. Commit `f1f4264`.

**État :** ✅ Livré et déployé
