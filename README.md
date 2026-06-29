# Tofdan — Site d'Astrophotographie

Site web 100% statique pour **www.tofdan.be**, dédié à la passion de l'astrophotographie partagée par Tof & Syl. Remplace l'ancien site Google Sites.

## Contexte du projet

- **Utilisateur :** Christophe (Développeur / Administrateur)
- **Serveur cible :** LEO (Nginx), répertoire de déploiement `/var/www/tofdan.be/`
- **Approche :** Mobile-First, responsive, sans frameworks ni étape de build
- **Thème visuel :** Fond spatial sombre (`#0a0a1a`), accents bleu/violet (`#4f46e5`, `#7c3aed`)
- **Typographie :** Google Fonts — Inter (corps) + Space Grotesk (titres)

## Arborescence

```
tofdan-site/
├── index.html              Accueil : Hero + bienvenue + En Vedette (Lune, Soleil)
├── astro.html              Présentation passion astronomie + coordonnées observation
├── app-astro.html          Application Astro interactive (lien externe GitHub Pages)
├── news.html               Actualités / Blog (4 articles d'exemple)
├── materiel.html           Inventaire : télescopes, caméras, oculaires (cartes)
├── album.html              Galerie photo responsive (Lune, Soleil, Ciel profond)
├── meteo-astro.html        Météo astronomique live — recherche de ville, géolocalisation, 8 indicateurs
├── biblio.html             Bibliographie, logiciels, liens utiles
├── chat.html               Formulaire de contact avec validation
├── css/
│   └── style.css           Feuille de style unique, modulaire (1496 lignes)
├── js/
│   ├── main.js             Navigation mobile, menu actif, formulaire, back-to-top
│   └── meteo.js            Module météo : API Open-Meteo, géocodage, géoloc, lune (600 lignes)
└── docs/
    └── analyse-meteo.md    Audit complet de l'application
```

## Statistiques du code

| Fichier              | Lignes         |
| -------------------- | -------------- |
| `css/style.css`    | 1496           |
| `js/meteo.js`      | 626            |
| `materiel.html`    | 191            |
| `meteo-astro.html` | 191            |
| `biblio.html`      | 182            |
| `album.html`       | 158            |
| `news.html`        | 125            |
| `chat.html`        | 113            |
| `index.html`       | 112            |
| `app-astro.html`   | 111            |
| `astro.html`       | 100            |
| `js/main.js`       | 99             |
| **Total**      | **3504** |

## Fonctionnalités techniques

- **Design responsive :** 3 breakpoints — mobile (< 640px), tablette (≥ 640px), desktop (≥ 1024px)
- **CSS moderne :** Variables CSS (design tokens), Grid & Flexbox, dégradés, filtres backdrop, animations
- **Navigation :** Header sticky avec backdrop blur, burger menu mobile (fullscreen overlay), lien actif détecté automatiquement
- **Formulaire de contact :** Validation HTML5 + JS (nom, email regex, message), message de succès
- **Bouton back-to-top :** Apparaît après 400px de scroll, smooth scroll
- **Galeries :** Placeholders avec emojis, overlay au survol, grid responsive
- **Météo astronomique :** Données météo live (Open-Meteo), recherche de ville, géolocalisation GPS, phase lunaire calculée localement, 5 dernières localisations en localStorage
- **Performances :** Zéro dépendance externe hors Google Fonts, script async-ready, CSS minifié non nécessaire vu la taille

## Spécifications respectées par page

### index.html

- Hero banner avec texte "ASTRO PHOTOGRAPHIE" en dégradé primary
- Message de bienvenue historique : *"Nous sommes heureux de vous présenter notre tout nouveau site web..."*
- Section "En Vedette" avec deux cartes : Lune et Soleil
- Boutons CTA vers Album et page Astro

### astro.html

- Texte de présentation de la passion astronomie (5 paragraphes)
- Signature "Syl & Tof" en fin de texte
- Coordonnées du site d'observation : **Latitude : 50°32' N, Longitude : 4°36' E** (Villers-la-Ville, Belgique)

### app-astro.html

- Présentation de l'application interactive
- 3 cartes descriptives : Catalogue, Éphémérides, Simulateur
- Bouton lien externe vers : `https://christophedanhier-hash.github.io/Projet-Astro/www/index.html`

### materiel.html

- 3 catégories en cartes : Télescopes (3), Caméras (3), Oculaires (3)
- Chaque carte liste les caractéristiques techniques

### album.html

- Grille CSS responsive (1, 2 puis 3 colonnes)
- 3 sections : Lune (6 items), Soleil (3 items), Ciel profond (6 items)
- Placeholders avec emojis + labels techniques

### chat.html

- Formulaire 3 champs : Nom, Email, Message
- Validation JS : champs requis, format email (regex), erreurs visuelles (`form__input--error`)
- Message de succès après soumission

### meteo-astro.html

- **8 indicateurs météo en temps réel** via l'API gratuite Open-Meteo (aucune clé requise) :
  couverture nuageuse (totale + basse/moyenne/haute), seeing (calcul composite Jet Stream + nuages + humidité),
  humidité avec alerte buée (point de rosée), vent + rafales, température, Jet Stream (250hPa), lever/coucher du Soleil
- **Phase lunaire calculée côté client** (algorithme astronomique, sans API) : nom de phase, % illumination, âge
- **Barre de recherche de ville** avec autocomplétion (API Open-Meteo Geocoding, gratuite)
- **Bouton géolocalisation GPS** (reverse geocoding via Nominatim/OpenStreetMap)
- **Historique des 5 dernières localisations** sauvegardé en localStorage (chips cliquables)
- Spinner de chargement, gestion d'erreur, bouton refresh, timestamp de dernière mise à jour
- Liens vers Meteoblue Astronomical Seeing et Clear Outside

### biblio.html

- 3 sections : Livres (3), Logiciels (4), Liens utiles (3)
- Chaque entrée avec icône, titre, méta, description et lien externe

### news.html

- Grille d'articles responsive avec date, titre, extrait et lien "Lire la suite"
- 4 articles d'exemple (juin 2025 à mars 2025)

## Déploiement

```bash
sudo cp -r * /var/www/tofdan.be/
sudo chown -R www-data:www-data /var/www/tofdan.be/
sudo systemctl reload nginx
```

Aucune étape de build nécessaire — fichiers statiques prêts à être servis.
