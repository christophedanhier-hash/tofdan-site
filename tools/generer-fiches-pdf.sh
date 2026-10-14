#!/usr/bin/env bash
# Genere un PDF par constellation via Chrome headless + tools/fiches-build/pilote.js
# Usage : outils/generer-fiches-pdf.sh [dossier_sortie]
set -u

SORTIE="${1:-/mnt/data/astro-constellations/pdf}"
PORT=8995
MIN_OCTETS=100000
DEPOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INDEX="$DEPOT/app/constellations/data/index.json"
CHROME="${CHROME:-google-chrome}"

mkdir -p "$SORTIE" || { echo "Impossible de creer $SORTIE" >&2; exit 1; }
[ -f "$INDEX" ] || { echo "Index introuvable : $INDEX" >&2; exit 1; }

SERVEUR_PID=""
nettoyer() {
  if [ -n "$SERVEUR_PID" ]; then
    kill "$SERVEUR_PID" 2>/dev/null
    wait "$SERVEUR_PID" 2>/dev/null
  fi
  rm -rf /tmp/genfiches-profil-*
  rm -f "$DEPOT/app/constellations/test2.html" \
        "$DEPOT/app/constellations/test2.js" \
        "$DEPOT/app/constellations/pilote.js"
}
trap nettoyer EXIT INT TERM

# Le banc doit etre servi A COTE de data/ : app.js charge 'data/index.json' en relatif.
cp "$DEPOT/tools/fiches-build/test2.html" \
   "$DEPOT/tools/fiches-build/test2.js" \
   "$DEPOT/tools/fiches-build/pilote.js" "$DEPOT/app/constellations/"

nohup python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$DEPOT" \
  >/tmp/genfiches-serveur.log 2>&1 &
SERVEUR_PID=$!

OK_SERVEUR=0
for _ in $(seq 1 50); do
  if curl -fs -o /dev/null "http://127.0.0.1:$PORT/app/constellations/test2.html"; then
    OK_SERVEUR=1; break
  fi
  sleep 0.2
done
if [ "$OK_SERVEUR" -ne 1 ]; then
  echo "Le serveur HTTP (port $PORT) ne repond pas" >&2
  exit 1
fi

taille() { stat -c %s "$1" 2>/dev/null || echo 0; }

# $1 = index (profil), $2 = id, $3 = nom_fr encode
generer() {
  local i="$1" id="$2" nom="$3" pdf="$SORTIE/$2.pdf"
  rm -f "$pdf"
  "$CHROME" --headless --disable-gpu --no-sandbox \
    --user-data-dir="/tmp/genfiches-profil-$i" \
    --virtual-time-budget=180000 --no-pdf-header-footer \
    --print-to-pdf="$pdf" \
    "http://127.0.0.1:$PORT/app/constellations/test2.html#fiche:$nom" \
    >/dev/null 2>&1
  [ "$(taille "$pdf")" -gt "$MIN_OCTETS" ]
}

PRODUITS=0
ECHECS=()
i=0
while IFS=$'\t' read -r id nom_enc; do
  i=$((i + 1))
  if generer "$i" "$id" "$nom_enc" || generer "$i" "$id" "$nom_enc"; then
    PRODUITS=$((PRODUITS + 1))
    echo "OK    $id ($(taille "$SORTIE/$id.pdf") octets)"
  else
    ECHECS+=("$id")
    echo "ECHEC $id ($(taille "$SORTIE/$id.pdf") octets)" >&2
  fi
done < <(jq -r '.constellations[] | [.id, (.nom_fr | @uri)] | @tsv' "$INDEX")

echo
echo "=== Resume ==="
echo "Constellations traitees : $i"
echo "PDF produits            : $PRODUITS"
echo "Echecs                  : ${#ECHECS[@]}"
if [ "${#ECHECS[@]}" -gt 0 ]; then
  printf '%s\n' "${ECHECS[@]}" | tee "$SORTIE/echecs.txt"
  exit 2
fi
rm -f "$SORTIE/echecs.txt"
exit 0
