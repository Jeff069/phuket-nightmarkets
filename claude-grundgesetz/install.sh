#!/usr/bin/env bash
# Installiert das Claude Code Grundgesetz.
#
#   ./install.sh                    -> nur global (~/.claude/CLAUDE.md)
#   ./install.sh /pfad/zum/projekt  -> global + Projekt-Setup
#
# Bestehende Dateien werden nie überschrieben, sondern als .bak gesichert.

set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT="${1:-}"

same() {
  # $1 Quelle, $2 Ziel — 0 wenn inhaltlich identisch
  if [ -d "$1" ]; then diff -rq "$1" "$2" >/dev/null 2>&1
  else cmp -s "$1" "$2"
  fi
}

backup() {
  [ -e "$1" ] || return 0
  local bak="$1.bak"
  local n=1
  while [ -e "$bak" ]; do bak="$1.bak.$n"; n=$((n + 1)); done
  mv "$1" "$bak"
  echo "  gesichert: $bak"
}

echo "== Global =="
mkdir -p "$HOME/.claude"
if [ -f "$HOME/.claude/CLAUDE.md" ]; then
  if same "$SRC/global/CLAUDE.md" "$HOME/.claude/CLAUDE.md"; then
    echo "  ~/.claude/CLAUDE.md ist bereits identisch — nichts zu tun"
  else
    echo "  ~/.claude/CLAUDE.md existiert bereits."
    backup "$HOME/.claude/CLAUDE.md"
    cp "$SRC/global/CLAUDE.md" "$HOME/.claude/CLAUDE.md"
    echo "  installiert: ~/.claude/CLAUDE.md"
    echo "  -> Sicherung prüfen und eigene Regeln von Hand zurückholen."
  fi
else
  cp "$SRC/global/CLAUDE.md" "$HOME/.claude/CLAUDE.md"
  echo "  installiert: ~/.claude/CLAUDE.md"
fi

if [ -z "$PROJECT" ]; then
  echo
  echo "Fertig. Für ein Projekt-Setup:  ./install.sh /pfad/zum/projekt"
  exit 0
fi

if [ ! -d "$PROJECT" ]; then
  echo "Fehler: '$PROJECT' ist kein Verzeichnis." >&2
  exit 1
fi
PROJECT="$(cd "$PROJECT" && pwd)"

echo
echo "== Projekt: $PROJECT =="

install_item() {
  # $1 Quellpfad, $2 Zielpfad, $3 Anzeigename
  if same "$1" "$2"; then
    echo "  unverändert: $3"
    return 0
  fi
  backup "$2"
  cp -r "$1" "$2"
  echo "  installiert: $3"
}

install_item "$SRC/project/CLAUDE.md" "$PROJECT/CLAUDE.md" "CLAUDE.md   <- AUSFÜLLEN, alle [Klammern] ersetzen"

mkdir -p "$PROJECT/.claude"
for item in settings.json hooks skills agents; do
  install_item "$SRC/project/dot-claude/$item" "$PROJECT/.claude/$item" ".claude/$item"
done

chmod +x "$PROJECT/.claude/hooks/format.sh"

echo
echo "Fertig."
echo
echo "Nächste Schritte:"
echo "  1. $PROJECT/CLAUDE.md ausfüllen — alle [eckigen Klammern] ersetzen."
echo "  2. 'claude' starten, '/hooks' prüfen (PostToolUse muss gelistet sein)."
echo "  3. '/memory' prüfen — beide CLAUDE.md müssen geladen sein."
