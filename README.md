# Tofdan — Site d'Astrophotographie

Site web 100% statique pour **www.tofdan.be**, dédié à la passion de l'astrophotographie partagée par Tof & Syl.

## Contexte

- **Développeur :** Christophe
- **Serveur cible :** LEO (Nginx) — `/var/www/tofdan.be/`
- **Approche :** Mobile-first, sans framework ni étape de build
- **Thème :** Fond spatial sombre (`#0a0a1a`), accents bleu/violet (`#4f46e5`, `#7c3aed`)
- **Typographie :** Google Fonts — Inter (corps) + Space Grotesk (titres)
- **État :** En construction (juin 2026)

---

## Arborescence

```
tofdan-site/
├── index.html              Accueil — Hero étoilé, section "En Vedette"
├── astro.html              Passion astronomie + coordonnées d'observation
├── app-astro.html          Vitrine de l'app Astro (lien externe GitHub Pages)
├── news.html               Actualités / Blog
├── materiel.html           Inventaire — télescopes, caméras, oculaires
├── album.html              Galerie photo (Lune, Soleil, Ciel profond)
├── meteo-astro.html        Météo astronomique live (8 indicateurs)
├── biblio.html             Livres, logiciels, liens utiles
├── chat.html               Page contact
├── css/
│   └── style.css           Design system complet (BEM, custom properties)
├── js/
│   ├── main.js             Navigation mobile, lien actif, back-to-top
│   └── meteo.js            Météo live, géocodage, géoloc GPS, phase lunaire
└── docs/
    └── audit-2026-06.md    Audit technique de l'application
```

---

## Fonctionnalités

### Navigation
- Header sticky avec backdrop blur
- Burger menu mobile (overlay fullscreen) avec `aria-expanded`
- Lien actif détecté automatiquement par comparaison du `pathname`
- Bouton back-to-top (seuil 400 px, smooth scroll)

### Météo astronomique (`meteo-astro.html`)
8 indicateurs en temps réel via l'API gratuite Open-Meteo (aucune clé requise) :

| Indicateur | Source |
|---|---|
| Couverture nuageuse (totale + basse/moyenne/haute) | `cloud_cover*` |
| Seeing composite (Jet Stream + nuages + humidité) | Calculé |
| Humidité + alerte buée (point de rosée) | `relative_humidity_2m`, `dew_point_2m` |
| Température | `temperature_2m` |
| Vent + rafales | `wind_speed_10m`, `wind_gusts_10m` |
| Jet Stream (250 hPa) | `wind_speed_250hPa` |
| Lever / coucher du Soleil | `daily.sunrise`, `daily.sunset` |
| Phase lunaire | Algorithme côté client (époque fixe + période synodique) |

Autres fonctionnalités météo :
- Barre de recherche de ville avec autocomplétion (Open-Meteo Geocoding API)
- Bouton géolocalisation GPS + reverse geocoding (Nominatim / OpenStreetMap)
- Historique des 5 dernières localisations en `localStorage` (chips cliquables)
- Spinner de chargement, gestion d'erreur, bouton refresh, timestamp

### Contact
La page contact affiche une notice "en construction" avec lien vers Facebook. Aucun formulaire fonctionnel pour l'instant.

---

## APIs externes utilisées

| API | Usage | Clé requise |
|---|---|---|
| `api.open-meteo.com/v1/forecast` | Données météo horaires | Non |
| `geocoding-api.open-meteo.com/v1/search` | Recherche de ville | Non |
| `nominatim.openstreetmap.org/reverse` | Reverse geocoding GPS | Non |

---

## Déploiement

```bash
sudo cp -r * /var/www/tofdan.be/
sudo chown -R www-data:www-data /var/www/tofdan.be/
sudo systemctl reload nginx
```

Aucune étape de build — fichiers statiques prêts à être servis directement.
