#!/usr/bin/env bash
# Iterative crawler: scan all local files for asset refs, download missing, repeat to fixpoint.
set -uo pipefail
BASE="https://tashfeen.me"
OUT="/workspace/site"
cd "$OUT"

scan_refs() {
  # JS/CSS/HTML text files (chunk names may appear with or without leading /_next/, plain or escaped quotes)
  find . -type f \( -name '*.js' -o -name '*.css' -o -name '*.html.raw' -o -name '*.html' \) -print0 2>/dev/null |
  xargs -0 grep -rhoE '(_next/)?static/chunks/[A-Za-z0-9_.-]+\.js|/_next/static/media/[A-Za-z0-9_.-]+\.[a-z0-9]+|/img/[A-Za-z0-9_./-]+\.(webp|png|jpe?g|svg|mp4|gif|avif)|/fonts/[A-Za-z0-9_.-]+\.(woff2?|ttf|otf)|\"/[A-Za-z0-9_@.%-]+\.(webp|png|jpe?g|svg|mp4|webm|gif|avif|ico|pdf|json)(\?[A-Za-z0-9_.-]+)?\"' 2>/dev/null |
  sed 's/\\\"//g; s/^\"//; s/\"$//' |
  sed -E 's#^(_next/)#/\1#; s#^(static/)#/_next/\1#' |
  sort -u
}

round=0
while :; do
  round=$((round+1))
  mapfile -t REFS < <(scan_refs)
  new=0
  for ref in "${REFS[@]}"; do
    [ -z "$ref" ] && continue
    # skip cross-origin/absolute URLs
    case "$ref" in http*|//*) continue;; esac
    dest=".$ref"
    if [ ! -s "$dest" ]; then
      mkdir -p "$(dirname "$dest")"
      if curl -sfL "$BASE$ref" -o "$dest"; then
        echo "[round $round] NEW $ref ($(stat -c%s "$dest") bytes)"
        new=$((new+1))
      else
        echo "[round $round] MISSING $ref"
        rm -f "$dest"
      fi
    fi
  done
  echo "=== round $round complete: $new new files ==="
  [ "$new" -eq 0 ] && break
  [ "$round" -ge 8 ] && { echo "max rounds reached"; break; }
done
echo "FINAL FILE COUNT: $(find . -type f | wc -l)"
