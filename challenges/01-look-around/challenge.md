---
id: look-around
title: Look around
module: first-day
concept: Where am I, and what is here?
introduces: [prompt, pwd, ls]
reuses: []
check: answer
answer_label: Name of the file
expected_answer: todo-for-new-hire.txt
---

## Story

It's your first day as a junior system administrator at a small web company.
Your manager sends a quick message:

> Welcome aboard! I left a file with your first task in your home directory.
> I forgot what I called it, sorry. It's the only *file* in there; the rest are folders.

You've just logged in to the company server. Time to look around.

## Goal

Find the name of the only file (not a folder) you can see in your home directory and
type it into the answer box.

## Hint 1

You start in your home directory. There is a short command that **l**i**s**ts what's
in the directory you are in.

## Hint 2

Type `ls` and press Enter. Folders and files are shown in different colours.

## Hint 3

Run `ls`. Folders are shown in **blue**; the one name that isn't blue is the file.
Type that name, exactly as shown (including `.txt`), into the answer box.

## Explanation

**The prompt.** `learner@learnbash:~$` tells you three things: you are the user
`learner`, on the machine `learnbash`, in the directory `~`. The `~` (tilde) is
short for your **home directory**, your own folder, here `/home/learner`.
The `$` means you are a normal user; for the all-powerful `root` user it shows `#`.

**`pwd`** (*print working directory*) shows the full path of the directory you are in:

```
$ pwd
/home/learner
```

**`ls`** (*list*) shows what is inside the current directory. On this machine,
like on Ubuntu, `ls` colours its output: **blue** for directories. That colour
comes from a setting in your `~/.bashrc` (`alias ls='ls --color=auto'`), so on
some other systems everything may be one colour. Two ways to tell files and
directories apart that work everywhere:

- `ls -F` adds a `/` after every directory name.
- `ls -l` shows a long listing; lines for directories start with `d`.

On its own, `ls` shows the directory you're in; it does not look inside sub-folders.
To see what's inside one, give its name: `ls projects`.

Names starting with a dot (like `.bashrc`) are **hidden**: plain `ls` skips them.
`ls -a` shows them too.
