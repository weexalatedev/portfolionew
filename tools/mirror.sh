#!/usr/bin/env bash
# Mirror https://tashfeen.me/ exactly into /workspace/site
set -euo pipefail
BASE="https://tashfeen.me"
OUT="/workspace/site"
mkdir -p "$OUT"

# 1) Download top-level routes
for p in "" process writing feed.xml sitemap.xml robots.txt; do
  name="${p:-index}"
  curl -sfL "$BASE/$p" -o "$OUT/${name//\//_}.html.raw" || echo "FAIL route $p"
done

# 2) Extract unique path-like asset refs from all fetched text
extract_refs() {
  cat "$@" | grep -oE '"/_next/static/[^"]+"' | tr -d '"' | sort -u
  cat "$@" | grep -oE '"/fonts/[^"]+"' | tr -d '"' | sort -u
  cat "$@" | grep -oE '"/images/[^"]+"' | tr -d '"' | sort -u
  cat "$@" | grep -oE '"/[A-Za-z0-9_@.%-]+\.(webp|png|jpg|jpeg|svg|mp4|webm|gif|ico|avif)"' | tr -d '"' | sort -u
  # RSC payloads escape quotes as \"
  cat "$@" | grep -oE '\\\\"/_next/static/[^\\\\"]+\\\\\\"' | sed 's/\\\\\"//g; s/\\\\"//g' | sort -u
}

mapfile -t REFS < <(extract_refs "$OUT"/*.html.raw)
echo "Found ${#REFS[@]} refs"
printf '%s\n' "${REFS[@]}" > /workspace/refs_round1.txt

# 3) Download each asset preserving path
for ref in "${REFS[@]}"; do
  ref="${ref//\\u0026/&}"
  dest="$OUT$ref"
  mkdir -p "$(dirname "$dest")"
  curl -sfL "$BASE$ref" -o "$dest" || echo "FAIL $ref"
done
echo "Round 1 done"
