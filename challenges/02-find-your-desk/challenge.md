---
id: find-your-desk
title: Find your desk
module: find-your-way
concept: Moving between directories
introduces: [cd, relative path]
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

From your home directory, run `cd projects/website/assets`. (Already inside `projects`?
Then `cd website/assets` is enough. `cd` on its own takes you back home.) `pwd` shows
where you are now.

## Explanation

**`cd`** (*change directory*) moves you to another directory. You tell it where to
go with a **path**: folder names separated by `/`.

`projects/website/assets` is a **relative path**: it's followed starting from the
directory you're in now. From your home directory, `cd projects/website/assets` takes
you three levels down in one go. From somewhere else, the same command fails, because
there's no `projects` folder there. `cd` on its own always takes you back home.

The prompt shows where you are (`~` is short for your home directory), and `pwd`
prints the full path.

**Tip:** press <kbd>Tab</kbd> while typing a path and Bash completes the name for
you (`cd pro` + <kbd>Tab</kbd> → `cd projects/`). It saves time and avoids typos.

`cd` prints nothing when it works. If the directory doesn't exist, you'll see an error
such as `No such file or directory`, and you stay where you were.

The next challenge shows how to get back on track when you've taken a wrong turn.
