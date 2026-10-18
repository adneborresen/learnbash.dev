---
id: back-on-track
title: Back on track
module: find-your-way
concept: Going up and jumping home
introduces: ["..", "~", absolute path]
reuses: [cd, relative path, pwd, ls]
check: state
---

## Story

A colleague sends you directions:

> The page you'll fix is in `projects/blog/assets`. Go there.

A minute later:

> Sorry, wrong project! I meant the **website's** source folder: `projects/website/src`.

## Goal

Go to `~/projects/blog/assets` first, as the first message says. Then get from there to
`~/projects/website/src` without starting over. When you're there, your prompt shows
`~/projects/website/src`. Then press **Check**.

## Hint 1

You don't have to go back to the start. There's a short name for "the folder one level
up". Use `pwd` to see where you are at any time.

## Hint 2

`..` means one level up: `cd ..` goes up one level, `cd ../..` two levels at once.
From `~/projects/blog/assets`, two levels up is `~/projects`, where both projects are.

## Hint 3

Run `pwd` to see where you are, then:

- in `~/projects/blog/assets`: `cd ../../website/src`
- in `~/projects` (if you already went up two levels): `cd website/src`
- anywhere else: `cd ~/projects/website/src` works from any folder.

## Explanation

Every directory has a special entry called **`..`**: its *parent*, the directory one
level up. (At the very top, `/`, there's nothing above: `..` is `/` itself.) You can use
it anywhere in a path:

- `cd ..` goes up one level.
- `cd ../..` goes up two levels.
- `cd ../../website/src` goes up two levels, then down into `website/src`.

A few more ways to get somewhere without retracing your steps:

| Path | Means |
|---|---|
| `~` | your home directory: `cd ~/projects` works from anywhere |
| `/home/learner/projects` | an **absolute path**: it starts with `/`, the top of the whole file system (the *root directory*), so it means the same place wherever you are |
| `.` | the current directory |

A path that doesn't start with `/`, like `website/src`, is **relative**: it's followed
from the directory you're in now. A `~` at the start is replaced by Bash with your home
directory before the command runs, so `~/projects` means `/home/learner/projects`.

Two shortcuts: `cd` on its own takes you home, and `cd -` jumps back to the directory you
were in before (it prints where it took you).

When you're lost, `pwd` tells you where you are, and `cd` on its own gets you back to a
place you know.
