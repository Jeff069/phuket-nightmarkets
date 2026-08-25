# Claude Code Grundgesetz

Ein sofort installierbares Regelwerk für Claude Code: eine globale Verfassung, eine Projektvorlage, automatische Qualitätskontrolle per Hook, drei Methodik-Skills, ein Review-Subagent und fertige Prompt-Vorlagen.

**Ziel:** aus einer fehleranfälligen Code-Generierungsmaschine einen deterministischen, nachvollziehbaren Entwicklungszyklus machen.

---

## Inhalt

```
global/CLAUDE.md              → das Grundgesetz, gilt für ALLE Projekte
project/CLAUDE.md             → Vorlage pro Projekt (ausfüllen)
project/dot-claude/           → wird im Zielprojekt zu .claude/
  settings.json               → PostToolUse-Hook für Auto-Formatierung
  hooks/format.sh             → formatiert JS/TS/Python/Go/Rust/Shell automatisch
  skills/feature-brief/       → erzwingt Explore → Plan → Implement → Commit
  skills/debug-isolation/     → Vier-Schritt-Debugging gegen Fehlerkaskaden
  skills/commit-message/      → Conventional Commits aus dem Diff
  agents/code-reviewer.md     → Review-Subagent, eigenes Kontextfenster
make-zip.sh                   → packt das Paket neu, z. B. nach eigenen Anpassungen
prompts/                      → vier Copy-Paste-Vorlagen für den Alltag
docs/workflow.md              → Rollenverteilung + Ablaufdiagramm (Mermaid)
docs/erweiterungen.md         → Skills, MCP-Server, Subagents, Worktrees
install.sh                    → macht Schritt 1 + 2 automatisch
```

---

## Installation

### Automatisch

```bash
./install.sh              # global installieren
./install.sh /pfad/zum/projekt   # global + Projekt-Setup
```

Das Skript legt nichts über bestehende Dateien: Vorhandenes wird als `.bak` gesichert.

### Von Hand

**Schritt 1 — Globale Verfassung** (einmalig, gilt für alle Projekte):

```bash
mkdir -p ~/.claude
cp global/CLAUDE.md ~/.claude/CLAUDE.md
```

Existiert dort schon eine Datei: **nicht überschreiben**, sondern den Inhalt anhängen und Widersprüche auflösen.

**Schritt 2 — Pro Projekt:**

```bash
cd /dein/projekt
cp -r /pfad/zu/diesem/paket/project/dot-claude .claude
cp /pfad/zu/diesem/paket/project/CLAUDE.md .
chmod +x .claude/hooks/format.sh
```

> Der Ordner heißt im Paket `dot-claude` und nicht `.claude`, damit Claude Code die
> Vorlage nicht versehentlich als eigene Konfiguration lädt, solange sie nur herumliegt.
> Beim Kopieren wird daraus `.claude` — so wie oben.

Dann `CLAUDE.md` öffnen und alle `[eckigen Klammern]` durch echte Werte ersetzen. **Das ist der wichtigste Schritt** — eine unausgefüllte Vorlage bringt nichts.

**Schritt 3 — Prüfen:**

```bash
claude
> /hooks      # PostToolUse muss gelistet sein
> /memory     # zeigt die geladenen CLAUDE.md-Dateien
```

Dann eine Datei ändern lassen und schauen, ob sie automatisch formatiert wurde.

---

## Die vier Regeln, auf die alles hinausläuft

1. **Kein Code vor dem Plan.** Erst Explore, dann Checkpoints, dann Freigabe.
2. **Ein Task, ein Commit.** Nach jedem verifizierten Checkpoint sofort einchecken.
3. **Ein Bug, ein Fix.** Mehrere gleichzeitig erzeugt Fehlerkaskaden.
4. **Beweis statt Behauptung.** Test gelaufen, Ausgabe gelesen, Ergebnis genannt.

---

## Wichtige Hinweise

**Die goldene Regel für CLAUDE.md:** Es ist keine Dokumentation und kein Wiki. Alles, was das Modell ohnehin weiß ("schreibe sauberen Code"), verschwendet Kontextfenster und muss raus. Verbote sind wertvoller als Empfehlungen.

**Pflegen:** Nach jeder wesentlichen Architektur-Entscheidung die Projekt-`CLAUDE.md` aktualisieren, bevor eine neue Session startet. Eine veraltete Verfassung ist schlimmer als keine.

**Der Hook ist optional, aber empfohlen.** Er nimmt dir die komplette Formatierungs-Diskussion mit der KI ab. Ist im Projekt kein Formatter installiert, tut er einfach nichts — er blockiert nie.

**Anpassen ist erwünscht.** Das hier ist ein Startpunkt, kein Dogma. Regeln, die im eigenen Projekt keinen Sinn ergeben, gehören gelöscht — jede überflüssige Zeile kostet Kontext.

---

## Offizielle Doku

- Best Practices: https://code.claude.com/docs/en/best-practices
- Hooks: https://code.claude.com/docs/en/hooks
- Skills: https://code.claude.com/docs/en/skills
- Subagents: https://code.claude.com/docs/en/sub-agents
- MCP: https://code.claude.com/docs/en/mcp
- Settings: https://code.claude.com/docs/en/settings
