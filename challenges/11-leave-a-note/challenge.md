---
id: leave-a-note
title: "Leave a note"
module: find-your-way
concept: "Creating and editing a file with nano"
introduces: ["nano"]
reuses: ["cat", "~"]
check: state
---

## Story

Your colleague needs a short handover note. Until now you have read or copied files; now you will write one yourself.

## Goal

Create `~/note.txt` with nano. Start with these lines:

```text
Team: website
Status: draft
Next: review logs
```

Press Enter between the lines; do not add a blank line after the last one.
Save it, then change only `draft` to `ready` and save again. The final note must contain exactly the three lines above with **Status: ready**. Check reads what is saved, not unsaved text in the editor.

## Hint 1

An editor lets you type into a file and change existing text. Use the arrow keys to move around; typing at the shell prompt would try to run a command instead.

## Hint 2

Run `nano ~/note.txt` unless the editor is already open. Type the three lines, pressing Enter between them and stopping after `logs`. Save with **Ctrl+O**, then **Enter** to confirm the filename.
Nano's `^O` means Ctrl+O, not the characters ^ and O. On a phone, use the Ctrl-O and Ctrl-X buttons below the terminal; swipe the key bar sideways if necessary.

## Hint 3

In nano, move to `Status: draft`, replace `draft` with `ready`, then press **Ctrl+O**, **Enter**. Press **Ctrl+X** to exit.
If you already saved the corrected note, do not type it again. At the shell prompt, `cat ~/note.txt` lets you check all three lines.

## Explanation

**nano** edits plain text. `nano ~/note.txt` opens an existing file or starts a new one. A new buffer is not a saved file until you write it.

- Arrow keys move the cursor; Backspace deletes the character before it.
- **Ctrl+O** writes the file. Confirm the displayed filename with **Enter**.
- **Ctrl+X** exits. If unsaved changes remain, nano asks whether to save them.

The `^` notation in nano's shortcut bar means Ctrl. Ctrl+C has a different purpose inside nano; use Ctrl+X to leave the editor.

You can press Check while nano is open. It inspects the saved file, so remember to save your latest edit first.
