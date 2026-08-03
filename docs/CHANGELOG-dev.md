# 📓 CHANGELOG Dev — tofdan-site

Journal de développement du site www.tofdan.be. Chaque entrée documente une itération : quoi, pourquoi, comment, qui, coût.

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
