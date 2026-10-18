---
id: rename-and-clean
title: Rename and clean up
module: find-your-way
concept: Renaming and moving files
introduces: [mv]
reuses: [rm, ls, cd]
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
Deleting works as in the last challenge.

## Hint 2

`mv OLDNAME NEWNAME` renames a file: replace the placeholders with real names. Go into
the folder first with `cd reports`.

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

Renaming with `mv` is safer than copying and deleting: there's never a moment with two
versions, and nothing to forget to clean up. `rm junk.tmp` then removes what's left, as
in the last challenge.

**Tip:** names with spaces need quotes: `mv "final report.txt" report.txt`.
Otherwise the shell treats `final` and `report.txt` as two separate names. That's
one reason Linux users tend to name files with `-` or `_` instead of spaces.
