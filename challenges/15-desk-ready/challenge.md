---
id: desk-ready
title: "Review: prepare the handover"
module: find-your-way
concept: "Review: preparing a workspace"
introduces: []
reuses: ["mkdir", "cp", "quoting", "nano", "mv", "rm", "*", "~"]
check: state
---

## Story

Your first shift is nearly over. The next person needs a tidy handover. This time, choose the commands yourself using what you have practised.

## Goal

Prepare `~/handover`:

- Copy `~/desk/handover template.txt` to `~/handover/note.txt` as an independent file. Change only `Status: draft` to `Status: ready` in the copy.
- Move all three `.log` files from `~/desk` into `~/handover/logs`, keeping their contents.
- Delete `~/desk/junk.tmp`.
- Keep the original template and `~/desk/protected-draft.txt` unchanged.

Each challenge starts fresh; all the inputs are already in this machine's desk folder.

## Hint 1

Check the required destinations first. The note and logs belong inside the handover folder, not beside it.

## Hint 2

The note is a corrected copy. The original template and protected draft should still contain exactly what they did at the start.

## Hint 3

Before checking: one corrected note, three complete logs in the handover's logs folder, no logs left on the desk, no junk file, and both protected originals intact.

## Explanation

This handover combines skills you have already practised: navigating, creating folders, copying a quoted filename, editing a saved file, moving matching files, and deleting one unwanted file.

The distinction between copying and moving matters: the template stays available for future shifts, while the logs have one new home. Previewing the names before acting helps avoid moving the protected draft.

There is more than one valid sequence of commands. What matters is the finished workspace and the files you preserved.
