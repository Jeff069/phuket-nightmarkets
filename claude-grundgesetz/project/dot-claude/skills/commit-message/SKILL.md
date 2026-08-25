---
name: commit-message
description: Erzeugt Conventional-Commit-Nachrichten aus dem aktuellen Git-Diff. Nutzen, wenn der Nutzer committen will, nach einer Commit-Message fragt, oder ein Checkpoint fertig verifiziert ist und eingecheckt werden soll.
---

# Commit-Message

## Ablauf

1. `git status --short` und `git diff --staged` lesen. Ist nichts gestaged: `git diff` lesen und fragen, was gestaged werden soll — nie blind `git add -A`.
2. Prüfen, ob das Diff **eine** logische Änderung ist. Enthält es mehrere unabhängige Änderungen: das melden und Aufteilung in mehrere Commits vorschlagen.
3. Message nach dem Format unten schreiben.
4. Committen. Danach `git log -1 --stat` zeigen.

## Format

```
<type>(<scope>): <beschreibung>

<optionaler body — erklärt WARUM, nicht was>
```

**Types:** `feat` neue Funktionalität · `fix` Bugfix · `refactor` Umbau ohne Verhaltensänderung · `test` Tests · `docs` Dokumentation · `perf` Performance · `build` Build/Deps · `ci` Pipeline · `chore` Sonstiges

**Regeln für die Beschreibungszeile:**
- Imperativ, Kleinbuchstaben, kein Punkt am Ende.
- Höchstens 72 Zeichen.
- Konkret. `fix(auth): handle empty token` — nicht `fix: bugs`.
- Scope ist das betroffene Modul (`auth`, `cart`, `api`), nicht ein Dateiname.

**Body** nur, wenn das Warum nicht offensichtlich ist. Zeilen auf 72 Zeichen umbrechen.

**Breaking Change:** `!` nach dem Scope und ein Absatz `BREAKING CHANGE: …` im Body.

## Verboten

- Keine Co-Author-Zeilen, keine Tool-Signaturen, keine Modellnamen, keine Emojis in der Message.
- Nichts committen, was nicht verifiziert wurde.
- Nie `--no-verify`.
- Nie `git push --force`.

## Beispiele

```
feat(cart): add empty-cart handling to checkout endpoint

fix(auth): reject tokens with malformed exp claim

Der Decoder warf bei nicht-numerischem exp eine ungefangene
TypeError und ließ den Request mit 500 crashen statt 401.

refactor(api): extract response envelope into shared helper
```
