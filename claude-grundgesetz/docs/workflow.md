# Der hybride Workflow

Architektonische Intelligenz und mechanische Geschwindigkeit werden strikt getrennt.

## Rollenverteilung

| Werkzeug | Paradigma | Zuständig für | Nicht zuständig für |
|---|---|---|---|
| **GitHub Copilot** | Inline, reaktiv | In-Flow-Vervollständigung, Boilerplate, Testgerüste beim Tippen | Alles, was mehrere Dateien überspannt |
| **OpenAI Codex** | Autonom, latenzarm | Deterministische Batch-Operationen, Umbenennungen, vorhersehbare Logik | Architekturfragen, alles mit Begründungsbedarf |
| **Claude Code** | Agentisch, erklärend | Planung, Architektur, Debugging, Review, Commits | Zeichenweise Autovervollständigung |

Die drei konkurrieren nicht — sie decken verschiedene Phasen ab.

## Ablauf

```mermaid
flowchart TD
    START([Aufgabe]) --> BRIEF[One-Paragraph Brief:<br/>Ziel · Architektur · Verbote]

    BRIEF --> EXPLORE[/"<b>EXPLORE</b> — Claude Code<br/>Dateien lesen, Muster finden"/]
    EXPLORE --> PLAN[/"<b>PLAN</b> — Claude Code<br/>Checkpoints definieren"/]
    PLAN --> GATE{Plan<br/>freigegeben?}
    GATE -->|nein| BRIEF

    GATE -->|ja| CP[Checkpoint N]

    CP --> KIND{Art der<br/>Arbeit?}
    KIND -->|"mechanisch<br/>(Rename, Boilerplate)"| FAST["Codex / Copilot<br/>Sekundenbruchteile"]
    KIND -->|"strukturell<br/>(Logik, Architektur)"| CLAUDE["Claude Code<br/>erklärt jeden Schritt"]

    FAST --> HOOK
    CLAUDE --> HOOK[["PostToolUse-Hook<br/>Formatter + Linter, automatisch"]]

    HOOK --> TEST{Tests grün?}
    TEST -->|nein| DEBUG[/"<b>DEBUG</b> — Claude Code<br/>1 Reproduzieren<br/>2 Isolieren<br/>3 Minimaler Fix<br/>4 Verifizieren"/]
    DEBUG --> LOOP{2× erfolglos<br/>am selben Bug?}
    LOOP -->|nein| TEST
    LOOP -->|ja| STOP([Abbrechen · /clear ·<br/>Lage berichten])

    TEST -->|ja| REVIEW[Intent-Review:<br/>tut das Diff nur das Beauftragte?]
    REVIEW --> COMMIT[["<b>COMMIT</b><br/>Conventional Commit<br/>ein Task = ein Commit"]]

    COMMIT --> MORE{weitere<br/>Checkpoints?}
    MORE -->|ja| BUDGET{">10 Dateien<br/>oder >500 Zeilen?"}
    BUDGET -->|ja| CLEAR[/clear · frischer Kontext/]
    CLEAR --> CP
    BUDGET -->|nein| CP
    MORE -->|nein| DONE([Fertig])

    style BRIEF fill:#1e3a5f,color:#fff
    style DEBUG fill:#5f1e1e,color:#fff
    style COMMIT fill:#1e5f2e,color:#fff
    style HOOK fill:#4a3f1e,color:#fff
    style STOP fill:#5f1e1e,color:#fff
```

## Die vier Kernregeln in einem Satz

1. **Kein Code vor dem Plan.** Checkpoints zuerst.
2. **Ein Task, ein Commit.** Sammeln heißt alles verlieren, wenn die letzte Änderung bricht.
3. **Ein Bug, ein Fix.** Mehrere gleichzeitig ergibt Fehlerkaskaden.
4. **Beweis statt Behauptung.** "Sollte gehen" zählt nicht.

## Kontext-Hygiene

Ab ~10 berührten Dateien oder ~500 geänderten Zeilen degradiert die Qualität messbar. Dann: committen, `/clear`, weiter. Steckt der Agent in einer Endlos-Korrekturschleife: `Ctrl+C`, `/clear`, mit präziserem Brief neu starten.
