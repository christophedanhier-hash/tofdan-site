#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Générateur de header/footer pour le site astro tofdan.be
=========================================================

POURQUOI CE SCRIPT
------------------
Les 11 pages astro de tofdan.be contenaient 3 variantes de <header> (logo différent,
nombre de liens différent, lien Hermes présent ou non) — cause racine de toutes les
petites divergences réparées une par une. Ce script remplace ces copies par UNE
source unique.

CE QU'IL FAIT
-------------
Pour chaque page de PAGES, il remplace le bloc <header class="header">…</header>
et le bloc <footer class="footer">…</footer> par le modèle défini ci-dessous.
RIEN D'AUTRE n'est touché : ni le <head>, ni le <main>, ni les scripts.

SÉCURITÉ
--------
- Mode par défaut : DRY-RUN (n'écrit rien). Utiliser --apply pour écrire.
- Sauvegarde .bak de chaque fichier modifié (horodatée) avant écriture.
- Vérifie que chaque page contient exactement 1 <header> et 1 <footer>.
  Sinon, la page est SIGNALÉE et NON MODIFIÉE.
- Ne touche JAMAIS à la zone Hermes (hermes.html, login.html).

USAGE
-----
    python3 tools/generate-nav.py            # dry-run : montre ce qui changerait
    python3 tools/generate-nav.py --apply    # écrit réellement

SOURCE DE VÉRITÉ : Gérard, 2026-10-11. Décisions de Christophe :
  - logo « 🌙 ASTRO PHOTOGRAPHIE » partout
  - ⛔ AUCUN lien vers /hermes/ dans la navigation astro (retiré le
    11/10/2026 sur demande de Christophe : « il y a un lien sur hermes
    retire cela pas possible »). L'espace Hermes est un espace privé
    protégé par cookie, il ne doit pas être exposé dans la navigation
    publique du site astro.
"""

import argparse
import os
import re
import shutil
import sys
from datetime import datetime

# ─── Racine du site (le script vit dans tools/ : la racine est son parent) ───
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ─── Périmètre : les 11 pages astro. La zone Hermes est EXCLUE. ───
PAGES = [
    "index.html",
    "astro.html",
    "app-astro.html",
    "news.html",
    "materiel.html",
    "album.html",
    "meteo-astro.html",
    "biblio.html",
    "chat.html",
    "cgu.html",
    "mentions-legales.html",
]

# Pages explicitement INTERDITES (zone Michel) — garde-fou
INTERDITES = {"hermes.html", "login.html"}

# ─── Modèle unique ───
HEADER = """\
  <header class="header">
    <div class="header__inner">
      <a href="index.html" class="header__logo">
        <span class="header__logo-icon">🌙</span>
        ASTRO PHOTOGRAPHIE
      </a>
      <nav class="nav" aria-label="Navigation principale">
        <button class="nav__toggle" aria-label="Menu" aria-expanded="false">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul class="nav__list">
          <li><a href="index.html" class="nav__link">Accueil</a></li>
          <li><a href="astro.html" class="nav__link">Astro</a></li>
          <li><a href="app-astro.html" class="nav__link">App Astro</a></li>
          <li><a href="news.html" class="nav__link">News</a></li>
          <li><a href="materiel.html" class="nav__link">Matériel</a></li>
          <li><a href="album.html" class="nav__link">Album</a></li>
          <li><a href="meteo-astro.html" class="nav__link">Météo</a></li>
          <li><a href="biblio.html" class="nav__link">Biblio</a></li>
          <li><a href="chat.html" class="nav__link">Contact</a></li>
        </ul>
      </nav>
    </div>
  </header>"""

FOOTER = """\
  <footer class="footer">
    <div class="footer__inner">
      <p class="footer__copyright">(C) Tofdan — 2026</p>
      <div class="footer__links">
        <a href="mentions-legales.html" class="footer__link">Mentions légales</a>
        <a href="cgu.html" class="footer__link">Conditions d'utilisation</a>
      </div>
      <div class="footer__social">
        <a href="https://www.facebook.com/tofdan" class="footer__social-link" target="_blank" rel="noopener noreferrer" aria-label="Facebook">f</a>
      </div>
    </div>
  </footer>"""

RE_HEADER = re.compile(r"[ \t]*<header\b.*?</header>", re.S | re.I)
RE_FOOTER = re.compile(r"[ \t]*<footer\b.*?</footer>", re.S | re.I)


def traiter(page: str, apply: bool) -> dict:
    """Traite une page. Retourne un rapport."""
    nom = os.path.basename(page)
    r = {"page": nom, "statut": "", "detail": ""}

    if nom in INTERDITES:
        r["statut"] = "INTERDIT"
        r["detail"] = "zone Hermes (Michel) — non touché"
        return r

    chemin = os.path.join(RACINE, page)
    if not os.path.exists(chemin):
        r["statut"] = "ABSENT"
        r["detail"] = "fichier introuvable"
        return r

    with open(chemin, encoding="utf-8") as f:
        src = f.read()

    nh = len(RE_HEADER.findall(src))
    nf = len(RE_FOOTER.findall(src))

    if nh != 1 or nf != 1:
        r["statut"] = "SIGNALÉ"
        r["detail"] = f"{nh} <header>, {nf} <footer> — attendu 1 et 1 (non modifié)"
        return r

    nouveau = RE_HEADER.sub(HEADER, src, count=1)
    nouveau = RE_FOOTER.sub(FOOTER, nouveau, count=1)

    if nouveau == src:
        r["statut"] = "IDENTIQUE"
        r["detail"] = "déjà conforme au modèle"
        return r

    if apply:
        ts = datetime.now().strftime("%Y%m%d-%H%M%S")
        shutil.copy2(chemin, f"{chemin}.bak-{ts}")
        with open(chemin, "w", encoding="utf-8") as f:
            f.write(nouveau)

    lignes_av = src.count("\n")
    lignes_ap = nouveau.count("\n")
    r["statut"] = "MODIFIÉ" if apply else "À MODIFIER"
    r["detail"] = f"{lignes_av} → {lignes_ap} lignes"
    return r


def main():
    ap = argparse.ArgumentParser(description="Génère header/footer uniques pour le site astro.")
    ap.add_argument("--apply", action="store_true",
                    help="écrit réellement (sinon : dry-run)")
    args = ap.parse_args()

    print("=" * 68)
    print("GÉNÉRATION HEADER/FOOTER — site astro tofdan.be")
    print(f"Mode : {'APPLICATION (écriture)' if args.apply else 'DRY-RUN (aucune écriture)'}")
    print(f"Racine : {RACINE}")
    print("=" * 68)

    rapports = [traiter(p, args.apply) for p in PAGES]

    largeur = max(len(r["page"]) for r in rapports)
    for r in rapports:
        print(f"  {r['page']:<{largeur}}  {r['statut']:<12} {r['detail']}")

    modif = sum(1 for r in rapports if r["statut"] in ("MODIFIÉ", "À MODIFIER"))
    signale = sum(1 for r in rapports if r["statut"] == "SIGNALÉ")
    ident = sum(1 for r in rapports if r["statut"] == "IDENTIQUE")

    print("-" * 68)
    print(f"  {modif} à modifier · {ident} déjà conformes · {signale} signalée(s)")
    if not args.apply and modif:
        print("\n  → Relancer avec --apply pour écrire (sauvegardes .bak créées).")

    return 1 if signale else 0


if __name__ == "__main__":
    sys.exit(main())