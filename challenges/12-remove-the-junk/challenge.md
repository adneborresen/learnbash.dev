---
id: remove-the-junk
title: Remove the junk
module: find-your-way
concept: Deleting files
introduces: [rm]
reuses: [cd, ls, relative path]
check: state
---

## Story

Your `inbox` folder has a duplicate in it:

> `invoice-march-copy.pdf` is an accidental second download of `invoice-march.pdf`.
> Delete the copy, but keep the real invoice, accounting needs it!

## Goal

Delete `~/inbox/invoice-march-copy.pdf`. Every other file in `~/inbox` must stay.

## Hint 1

Deleting a file is called *removing* it. `ls inbox` shows what's there.

## Hint 2

`rm FILE` deletes a file. Replace FILE with the path of the copy. Type the name
carefully, or let <kbd>Tab</kbd> complete it.

## Hint 3

From your home directory, run `rm inbox/invoice-march-copy.pdf`, then check with
`ls inbox`.

## Explanation

**`rm`** (*remove*) deletes files: `rm inbox/invoice-march-copy.pdf`. Several at
once: `rm a.txt b.txt`.

> ⚠️ **`rm` has no trash bin and no undo.** A deleted file is gone. Check the name
> before pressing Enter, or use `rm -i`, which asks before each file (answer `y` or `n`).

<kbd>Tab</kbd> helps here too: typing `rm inbox/invoice-march-c` and pressing
<kbd>Tab</kbd> completes the name, so a typo can't make you delete the wrong file.

On its own, `rm` only deletes files. For directories:

- `rmdir old` removes an **empty** directory.
- `rm -r old` removes a directory **and everything inside it**. Be very careful
  with it, especially combined with `-f` (*force*: don't ask, ignore missing files).

Like `mkdir`, `rm` prints nothing when it works.
