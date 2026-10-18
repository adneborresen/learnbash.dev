---
id: make-room
title: Make room
module: find-your-way
concept: Creating directories
introduces: [mkdir]
reuses: [cd, ls, relative path]
check: state
---

## Story

Your team lead has a request:

> Keep your meeting notes in one place: make a folder called `notes` inside
> `projects`, next to the website.

## Goal

Create the directory `~/projects/notes`.

## Hint 1

There's a command to **m**a**k**e a **dir**ectory. `ls projects` shows what's in
`projects` now.

## Hint 2

`mkdir NAME` creates a directory called NAME in the directory you're in. You can also
give it a path, like `mkdir some/where/NAME`. Replace the placeholders with real names.

## Hint 3

From your home directory, run `mkdir projects/notes`. Check with `ls projects`. Like many
commands, `mkdir` prints nothing when it works.

## Explanation

**`mkdir`** (*make directory*) creates a directory: `mkdir notes` creates it where you
are, and `mkdir projects/notes` creates it inside `projects`. You can give several names
at once: `mkdir drafts archive`.

Two common errors:

- **`File exists`**: there's already something with that name.
- **`No such file or directory`**: a folder in the path is missing.
  `mkdir projects/2026/notes` fails if `projects/2026` doesn't exist yet.

Add **`-p`** (*parents*) to create the missing folders along the way:
`mkdir -p projects/2026/notes` creates `2026` and `notes`. With `-p`, `mkdir` also
stays quiet if the directory already exists.

Commands like `mkdir` that work silently are normal in Linux: no news is good news.
`ls` shows you the result.
