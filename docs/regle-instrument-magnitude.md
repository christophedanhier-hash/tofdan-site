# Instrument dérivé de la magnitude — règle et source

## Objectif
Renseigner le champ `instrument` pour les **120 objets** aujourd'hui en `n. d.`
(dans `app/constellations/data/*.json`, clé `objets_ciel_profond[].instrument`).

L'Atlas d'observation OCA ne donne pas l'instrument → l'information manque.
Plutôt qu'inventer, on **dérive l'instrument de la magnitude publiée** (96/120 objets
ont une magnitude ; 24 n'en ont pas → ils resteront `n. d.`, documentés).

## Règle magnitude → instrument (seuils)

| Magnitude V | Instrument retenu | Justification |
|---|---|---|
| ≤ 6,0 | `œil nu` | limite visuelle sous ciel sombre : 6,0–6,5 |
| 6,1 – 9,5 | `jumelles` | jumelles 10x50 : ~9,5–10 en ciel de campagne |
| > 9,5 | `télescope` | au-delà des jumelles |

Note : 24 objets **sans magnitude publiée** (nébuleuses diffuses en émission/réflexion,
nébuleuse sombre) → **restent `n. d.`**, avec lacune documentée dans la fiche.
La magnitude n'a pas de sens pour ces objets (surface diffuse) ; en inventer une serait faux.

## Sources
- Limite œil nu : Sky & Telescope, « What's my naked-eye magnitude limit? »
  — comptage dans le Grand Carré de Pégase : 8 étoiles ⇒ mag 5,5 ; 13 étoiles ⇒ mag 6,0 ;
  31-37 étoiles ⇒ mag 6,5 (nuit exceptionnelle).
  https://skyandtelescope.org/astronomy-resources/astronomy-questions-answers/naked-eye-magnitude-limit/
- Limite jumelles 10x50 : étude de terrain Cloudy Nights (mesures sur le champ de M 45) :
  jumelles 10x50 ⇒ magnitude limite mesurée ~9,5 à 10,1 selon la qualité du ciel.
  https://www.cloudynights.com/topic/4304-limiting-magnitude-charts-and-tables/
- Échelle générale : Harvard ICQ, « The astronomical magnitude scale »
  (limite visuelle générale ~mag 11 pour un télescope de 15 cm).
  http://www.icq.eps.harvard.edu/MagScale.html

## Limite de la méthode (à assumer)
C'est un **classement indicatif**, pas une mesure instrumentale : la visibilité réelle
d'un objet diffus dépend aussi de sa **brillance de surface**, pas seulement de sa
magnitude intégrée. Deux garde-fous :
1. Le seuil est **conservateur** (9,5 pour les jumelles, pas 10,5).
2. Les objets **sans magnitude** ne reçoivent **aucune** valeur (jamais inventée).
Le `n. d.` restant est donc honnête, pas un échec.

## Application
- Gérard collecte la règle et la source (fait ici).
- Copilot écrit les JSON + l'intégration.
- Gérard revérifie chiffre par chiffre le travail de Copilot.