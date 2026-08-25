# Grundgesetz

Gilt für alle Projekte. Projekt-`CLAUDE.md` ergänzt, hebt nie auf.
Bei Konflikt: Projekt-Regel gewinnt bei Stack/Style, dieses Dokument gewinnt bei Artikel 4 und 6.

---

## Art. 1 — Arbeitsablauf

Jede nicht-triviale Aufgabe läuft in vier Phasen: **Explore → Plan → Implement → Commit**.

1. **Explore** — Erst lesen, dann reden. Relevante Dateien öffnen, bevor eine Aussage über sie getroffen wird.
2. **Plan** — Kurzer Plan mit nummerierten Checkpoints. Bei mehr als 3 Dateien oder neuem Architektur-Muster: Plan zeigen und auf Freigabe warten.
3. **Implement** — Ein Checkpoint nach dem anderen. Nicht vorgreifen.
4. **Commit** — Nach jedem verifizierten Checkpoint sofort committen.

Trivial (Tippfehler, ein Wert, eine Zeile) heißt: direkt machen, kein Plan-Theater.

## Art. 2 — Ein Task, ein Commit

- Nach jedem grün verifizierten Checkpoint wird committet.
- Niemals fünf Änderungen sammeln und am Ende committen. Bricht die letzte, ist alles verloren.
- Commit-Format: Conventional Commits — `feat(scope): …`, `fix(scope): …`, `refactor(scope): …`, `test(scope): …`, `docs(scope): …`, `chore(scope): …`.
- Commit-Message beschreibt **warum**, nicht was. Das Diff sagt schon was.
- Nie committen, was nicht verifiziert wurde.

## Art. 3 — Debugging: ein Bug, ein Fix

Bei Fehlern gilt zwingend diese Reihenfolge:

1. **Reproduzieren** — Fehler erst provozieren, Logs erzeugen (`--verbose` o. ä.). Ohne Repro kein Fix.
2. **Isolieren** — Über 80 % der Fehler stecken in den jüngsten Änderungen. Erst `git diff` / `git log` / `git bisect`, dann Scope auf die verdächtigen Dateien begrenzen.
3. **Minimaler Fix** — Kernursache beheben, nicht das Symptom maskieren. Verboten: leere `catch`-Blöcke, `try/except: pass`, `@ts-ignore`, `any` als Ausweg, auskommentierte Assertions.
4. **Verifizieren** — Testkommando selbst ausführen, Ergebnis lesen, iterieren bis grün. Ein Fix ohne bestandenen Test ist kein Fix.

**Anti-Kaskaden-Regel:** Niemals mehrere Bugs gleichzeitig beheben. Fällt unterwegs ein weiterer Fehler auf: notieren, nicht anfassen, danach separat angehen.

## Art. 4 — Verbote

Ohne ausdrückliche Erlaubnis pro Fall niemals:

- Datenbankschema oder Migrationen ändern.
- Authentifizierungs-, Autorisierungs- oder Krypto-/Hashing-Logik ändern.
- Neue Dependencies hinzufügen. Erst fragen, mit Begründung warum die vorhandenen nicht reichen.
- Tests löschen, überspringen, `skip`/`only` setzen oder Assertions abschwächen, um grün zu werden.
- Secrets, Keys, Tokens oder Passwörter hardcoden — auch nicht "nur zum Testen".
- `git push --force`, `git reset --hard`, History umschreiben, Branches löschen.
- Generierte Dateien (Lockfiles, Schemas, Build-Output) von Hand editieren — immer über das Tooling regenerieren.
- Dateien außerhalb des Projektverzeichnisses ändern.
- Massen-Umbenennungen oder projektweite Refactorings, die nicht beauftragt wurden.

## Art. 5 — Kontext-Disziplin

- **Just-in-Time lesen.** Dateien beim Bedarf öffnen, nicht das halbe Repo vorladen.
- **Nie raten.** Existiert eine Datei, Funktion oder Signatur nicht sicher: nachsehen. Erfundene Pfade und APIs sind der teuerste Fehlertyp.
- **Session-Hygiene.** Ab ca. 10 berührten Dateien oder 500 geänderten Zeilen degradiert die Qualität. Dann: committen, `/clear`, mit frischem Kontext weiter.
- **Korrektur-Schleife abbrechen.** Nach zwei erfolglosen Fix-Versuchen am selben Problem: stoppen, Lage und Hypothesen berichten, nachfragen. Nicht ein drittes Mal dasselbe probieren.
- **Verfassung pflegen.** Nach jeder wesentlichen Architektur-Entscheidung Projekt-`CLAUDE.md` aktualisieren, bevor eine neue Session startet.

## Art. 6 — Beweispflicht

Behauptungen über Erfolg brauchen Belege.

- "Funktioniert" heißt: Testkommando lief, Ausgabe gelesen, Ergebnis genannt.
- Läuft ein Test nicht, wurde etwas ausgelassen oder ist unsicher: **das wird gesagt**, klar und ohne Beschönigung.
- Bei UI-Arbeit: Screenshot des Ergebnisses, Vergleich mit dem Ziel, Abweichungen auflisten, dann korrigieren.
- Kein "sollte jetzt gehen". Entweder geprüft oder als ungeprüft deklariert.

## Art. 7 — Code-Stil (Grundlinie)

- Code passt sich der Umgebung an: bestehende Namensgebung, Struktur und Kommentardichte der Nachbardateien übernehmen.
- Bestehende Utilities und Muster wiederverwenden, statt Parallelwelten zu bauen.
- Keine Kommentare, die das Offensichtliche wiederholen. Kommentare erklären das Warum.
- Keine toten Pfade, keine spekulative Abstraktion für Anforderungen, die nicht existieren.
- Fehler nach oben propagieren, nicht verschlucken.
- Kein Reformatieren unberührter Zeilen — das Diff bleibt lesbar.

## Art. 8 — Kommunikation

- Antwort in der Sprache des Nutzers.
- Erst das Ergebnis, dann die Begründung. Keine Vorreden.
- Unsicherheit wird benannt, nicht überspielt.
- Bei zwei plausiblen Auslegungen einer Anforderung: die wahrscheinlichere umsetzen und die Annahme nennen — oder nachfragen, wenn ein Fehlgriff die Arbeit wertlos macht.
