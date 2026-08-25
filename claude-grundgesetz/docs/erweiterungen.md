# Erweiterungen: Skills, MCP, Subagents

Drei Ebenen, die oft verwechselt werden:

| Ebene | Beantwortet | Beispiel |
|---|---|---|
| **CLAUDE.md** | Was gilt immer? | "Keine Default Exports." |
| **Skills** | Wie löse ich Aufgabentyp X? | "So schreibst du eine Commit-Message." |
| **MCP** | Woran komme ich dran? | Datenbank, GitHub, Slack |
| **Subagents** | Wer macht es parallel? | Review-Agent im eigenen Kontext |

---

## Skills

Werden autonom geladen, wenn der Kontext passt, und kosten im Leerlauf fast keine Token.

**Enthalten in diesem Paket** (`.claude/skills/`):
- `feature-brief` — erzwingt Explore→Plan→Implement→Commit
- `debug-isolation` — die Vier-Schritt-Methodik gegen Fehlerkaskaden
- `commit-message` — Conventional Commits aus dem Diff

**Der eine Fehler, den man beim Schreiben eigener Skills macht:** eine vage `description`. Sie ist das Einzige, woran Claude entscheidet, ob der Skill geladen wird. Vage Beschreibungen laden den Skill in Situationen, wo er nichts nützt — das verschwendet Kontext und verschlechtert die Antworten.

```
Schlecht:  description: Hilft beim Committen.
Gut:       description: Erzeugt Conventional-Commit-Nachrichten aus dem aktuellen
           Git-Diff. Nutzen, wenn der Nutzer committen will, nach einer
           Commit-Message fragt, oder ein Checkpoint verifiziert ist.
```

Regel: die Beschreibung nennt **wann** zu nutzen, nicht nur **was** er tut.

**Skill selbst anlegen:** `.claude/skills/<name>/SKILL.md` mit Frontmatter `name` + `description`, darunter die Anleitung in Markdown. Vorhandene Skills hier als Vorlage nehmen.

---

## MCP-Server

Geben Claude Zugriff auf echte externe Systeme statt auf Vermutungen.

Lohnenswert, in dieser Reihenfolge:

1. **GitHub / GitLab** — PRs und Issues direkt lesen, statt sie beschrieben zu bekommen.
2. **Datenbank (Postgres o. ä.)** — Schema live abfragen. Beendet die häufigste Halluzinationsquelle bei Backend-Bugs: erfundene Spaltennamen. **Nur mit Read-Only-Zugang und niemals gegen Produktion.**
3. **Slack** — Fehlerberichte aus Threads direkt in den Kontext holen.

Installiert wird per `claude mcp add …`; die aktuellen Servernamen und Argumente stehen in der offiziellen Doku (siehe `README.md`). Vorsicht: jeder MCP-Server erweitert die Angriffsfläche und den Token-Verbrauch. Nur einbinden, was regelmäßig gebraucht wird.

---

## Subagents

Eigenes Kontextfenster, laufen parallel, verstopfen die Hauptsitzung nicht.

**Enthalten:** `code-reviewer` (`.claude/agents/code-reviewer.md`) — prüft Diffs gegen Absicht und Projektregeln, läuft auf dem günstigeren Sonnet-Modell.

**Isolierte Worktrees** — das eigentliche Profi-Feature. Ein Agent mit `isolation: worktree` in seinem Frontmatter arbeitet in einem eigenen physischen Ordner auf eigenem Branch. Ein großes Refactoring läuft dort komplett durch; der eigene Branch bleibt unberührt, bis die Tests im Worktree grün sind. Kostet Setup-Zeit und Plattenplatz — nur für Aufgaben nehmen, die wirklich parallel oder wirklich riskant sind.

---

## Was man sich sparen kann

- **Regeln, die das Modell ohnehin kennt.** "Schreibe sauberen Code", "nutze aussagekräftige Variablennamen" — reine Token-Verschwendung.
- **Business-Kontext in CLAUDE.md.** Die Datei ist kein Firmen-Wiki. Nur was die Codegenerierung direkt steuert.
- **Zwanzig Skills auf Vorrat.** Jeder Skill mit unpräziser Beschreibung ist ein Risiko, nicht ein Feature.
