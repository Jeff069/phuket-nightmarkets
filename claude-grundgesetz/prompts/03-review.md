# Review vor dem Commit

## Intent-Abgleich (Selbstreview)

```
Bevor wir committen: prüfe dein eigenes Diff kritisch gegen meinen ursprünglichen Auftrag.

1. git diff lesen.
2. Für jede Änderung: war sie beauftragt? Markiere alles, was ich nicht verlangt habe.
3. Prüfe gegen die Regeln in CLAUDE.md — gibt es Verstöße?
4. Suche konkrete Fehlerfälle: Nullwerte, leere Listen, Fehlerpfade.
   Jeder Befund braucht ein Szenario "Eingabe X → falsches Ergebnis Y".
5. Deckt ein Test die Änderung ab? Würde er ohne den Fix fehlschlagen?

Ausgabe: Befundliste nach Schwere. Sei streng mit dir. Erfinde nichts,
um nützlich zu wirken — ist es sauber, sag "keine Befunde".
```

## Review delegieren (eigenes Kontextfenster)

```
Nutze den code-reviewer Subagent, um das aktuelle Diff zu prüfen.
```

Läuft in eigenem Kontext und verstopft die Hauptsitzung nicht.

## Großes Refactoring isoliert

```
Führe dieses Refactoring in einem isolierten Git-Worktree durch.
Mein aktueller Branch bleibt unberührt.
Melde dich erst, wenn die Tests im Worktree grün sind.
```
