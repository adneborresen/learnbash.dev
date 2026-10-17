---
id: find-your-desk
title: Find your desk
module: first-day
concept: Moving between directories
introduces: [cd, absolute path, relative path, "..", "~"]
reuses: [pwd, ls]
check: state
---

## Story

Your task file says:

> The company website lives in `projects/website` in your home directory.
> Its images are in a folder called `assets` inside it. Go there so you can
> start working.

## Goal

Make `/home/learner/projects/website/assets` your current directory. When you're
there, your prompt shows `~/projects/website/assets`. Then press **Check**.

## Hint 1

There is a command to **c**hange **d**irectory. Use `ls` to see where you can go next.

## Hint 2

`cd projects` moves you into the `projects` folder. You can go several levels at
once by separating folder names with `/`.

## Hint 3

From your home directory, run `cd projects/website/assets`. Check with `pwd`.

## Explanation

**`cd`** (*change directory*) moves you to another directory. You can tell it
where to go in two ways:

- An **absolute path** starts with `/`, the top of the whole file system (the
  *root directory*). It works no matter where you are:
  `cd /home/learner/projects/website/assets`
- A **relative path** does not start with `/`. It is followed starting from the
  directory you are in now: from `/home/learner`, `cd projects/website/assets`
  ends up in the same place.

A few special names save typing:

| Name | Means |
|---|---|
| `..` | the parent directory (one level up): `cd ..` |
| `.` | the current directory |
| `~` | your home directory: `cd ~/projects` works from anywhere |

`cd` on its own takes you home. `cd -` jumps back to the directory you were in
before.

**Tip:** press <kbd>Tab</kbd> while typing a path and Bash completes the name for
you (`cd pro` + <kbd>Tab</kbd> → `cd projects/`). It saves time and avoids typos.

`cd` normally prints nothing when it works (`cd -` is an exception: it prints where
it took you). If the directory doesn't exist,
you'll see an error such as `No such file or directory`, and you stay where you
were.
