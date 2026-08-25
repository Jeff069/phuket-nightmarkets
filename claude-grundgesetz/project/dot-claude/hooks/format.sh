#!/usr/bin/env bash
# PostToolUse-Hook: formatiert jede von Claude geänderte Datei automatisch.
#
# Läuft still im Hintergrund. Der Agent muss nie um Formatierung gebeten werden.
# Exit 0 auch bei Fehlern: ein kaputter Formatter darf den Workflow nie blockieren.

set -uo pipefail

payload="$(cat)"

# Pfad der geänderten Datei aus dem Hook-Payload ziehen (jq bevorzugt, sed als Fallback).
if command -v jq >/dev/null 2>&1; then
  file="$(printf '%s' "$payload" | jq -r '.tool_input.file_path // .tool_input.notebook_path // empty' 2>/dev/null)"
else
  file="$(printf '%s' "$payload" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)"
fi

[ -n "${file:-}" ] && [ -f "$file" ] || exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

case "$file" in
  # --- JS / TS / Web ---
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs|*.json|*.css|*.scss|*.html|*.md|*.yml|*.yaml)
    if [ -x node_modules/.bin/biome ]; then
      node_modules/.bin/biome format --write "$file" >/dev/null 2>&1
    elif [ -x node_modules/.bin/prettier ]; then
      node_modules/.bin/prettier --write "$file" >/dev/null 2>&1
    fi
    if [ -x node_modules/.bin/eslint ]; then
      node_modules/.bin/eslint --fix "$file" >/dev/null 2>&1
    fi
    ;;

  # --- Python ---
  *.py)
    if command -v ruff >/dev/null 2>&1; then
      ruff format "$file" >/dev/null 2>&1
      ruff check --fix "$file" >/dev/null 2>&1
    elif command -v black >/dev/null 2>&1; then
      black -q "$file" >/dev/null 2>&1
    fi
    ;;

  # --- Go ---
  *.go)
    command -v gofmt >/dev/null 2>&1 && gofmt -w "$file" >/dev/null 2>&1
    ;;

  # --- Rust ---
  *.rs)
    command -v rustfmt >/dev/null 2>&1 && rustfmt --edition 2021 "$file" >/dev/null 2>&1
    ;;

  # --- Shell ---
  *.sh|*.bash)
    command -v shfmt >/dev/null 2>&1 && shfmt -w "$file" >/dev/null 2>&1
    ;;
esac

exit 0
