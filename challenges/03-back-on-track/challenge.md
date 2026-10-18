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

`cd ..` goes up one level. `cd ../..` goes up two levels at once. From
`~/projects/blog/assets`, two levels up is `~/projects`.

## Hint 3

Run `cd projects/blog/assets` (if you're not there yet), then `cd ../../website/src`.
`pwd` shows where you ended up. From anywhere, `cd ~/projects/website/src` also works.

## Explanation

Every directory has a special entry called **`..`**: its *parent*, the directory one
level up. You can use it anywhere in a path:

- `cd ..` goes up one level.
- `cd ../..` goes up two levels.
- `cd ../../website/src` goes up two levels, then down into `website/src`.

A few more ways to get somewhere without retracing your steps:

| Path | Means |
|---|---|
| `~` | your home directory: `cd ~/projects` works from anywhere |
| `/home/learner/projects` | an **absolute path**: it starts with `/`, the top of the whole file system (the *root directory*), so it means the same place wherever you are |
| `.` | the current directory |

A path that doesn't start with `/` or `~`, like `website/src`, is **relative**: it's
followed from the directory you're in now.

Two shortcuts: `cd` on its own takes you home, and `cd -` jumps back to the directory you
were in before (it prints where it took you).

When you're lost, `pwd` tells you where you are, and `cd` on its own gets you back to a
place you know.
