#!/usr/bin/env bash
# Packt das Paket neu — z. B. nachdem eigene Regeln ergänzt wurden.
# Ergebnis: claude-grundgesetz.zip neben dem Paketordner.

set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NAME="$(basename "$SRC")"
OUT="$(dirname "$SRC")/claude-grundgesetz.zip"

command -v zip >/dev/null 2>&1 || { echo "Fehler: 'zip' ist nicht installiert." >&2; exit 1; }

rm -f "$OUT"
cd "$(dirname "$SRC")"
zip -r "$OUT" "$NAME" -x '*.DS_Store' '*/.git/*' >/dev/null

echo "erstellt: $OUT"
unzip -l "$OUT" | tail -1
