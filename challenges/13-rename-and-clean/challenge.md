---
id: rename-and-clean
title: Rename and clean up
module: find-your-way
concept: Renaming, moving and deleting files
introduces: [mv, rm]
reuses: [ls, cd]
check: state
---

## Story

The `~/reports` folder is a mess. Your manager asks:

> Can you rename `report_final_FINAL.txt` to `q3-report.txt`? And delete
> `junk.tmp` while you're there. Leave everything else alone, especially the draft!

## Goal

In `~/reports`: rename `report_final_FINAL.txt` to `q3-report.txt` and delete
`junk.tmp`. All other files must stay.

## Hint 1

You don't need a special "rename" command: renaming a file is *moving* it to a new name.
Deleting is called *removing*.

## Hint 2

`mv OLDNAME NEWNAME` renames a file. `rm FILE` deletes it. Go into the folder first
with `cd reports`.

## Hint 3

Run `cd reports` (unless you're in it already), then
`mv report_final_FINAL.txt q3-report.txt`, then
`rm junk.tmp`. Check with `ls`.

## Explanation

**`mv`** (*move*) does two jobs:

- **Rename:** `mv report_final_FINAL.txt q3-report.txt`
- **Move into a directory:** `mv q3-report.txt archive/` (the name stays the same)

or both at once: `mv q3-report.txt archive/2026-q3.txt`. Unlike `cp`, the original
is gone afterwards. Like `cp`, `mv` silently **overwrites** a file that already has
the new name; `mv -i` asks first.

**`rm`** (*remove*) deletes files: `rm junk.tmp`.

> ⚠️ **`rm` has no trash bin and no undo.** A deleted file is gone. Double-check the
> name before pressing Enter, or use `rm -i`, which asks for each file.

On its own, `rm` only deletes files. For directories:

- `rmdir old` removes an **empty** directory.
- `rm -r old` removes a directory **and everything inside it**. Be very careful
  with it, especially combined with `-f` (*force*: don't ask, ignore missing files).

**Tip:** names with spaces need quotes: `mv "final report.txt" report.txt`.
Otherwise the shell treats `final` and `report.txt` as two separate names. That's
one reason Linux users tend to name files with `-` or `_` instead of spaces.
