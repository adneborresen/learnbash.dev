---
id: make-a-backup
title: Make a backup
module: first-day
concept: Creating directories and copying files
introduces: [mkdir, cp]
reuses: [ls, cd]
check: state
---

## Story

Tomorrow you'll change the web server's settings. Your team lead has one rule:

> Before you touch a config file, make a backup. Put copies of `nginx.conf` and
> `app.conf` in a new folder called `backup` in your home directory.

The two files are in `~/config`.

## Goal

Create the directory `~/backup` and copy `nginx.conf` and `app.conf` from `~/config`
into it. The originals must stay where they are.

## Hint 1

You need two commands: one to **m**a**k**e a **dir**ectory, and one to **c**o**p**y files.

## Hint 2

`mkdir backup` creates the folder (run it in your home directory). `cp FILE FOLDER/`
copies a file into a folder.

## Hint 3

In your home directory, run:
`mkdir backup`, then `cp config/nginx.conf config/app.conf backup/`.
Check the result with `ls backup`.

## Explanation

**`mkdir`** (*make directory*) creates a directory: `mkdir backup`. To create several
levels at once, add `-p`: `mkdir -p backup/2026/october` also creates the missing
parents (and doesn't complain if they already exist).

**`cp`** (*copy*) copies files. It works in two ways:

- `cp SOURCE NEWNAME` makes a copy under a new name: `cp app.conf app.conf.bak`
- `cp FILE1 FILE2 ... DIRECTORY` copies files *into* an existing directory, keeping
  their names: `cp config/nginx.conf config/app.conf backup/`

That double meaning is a classic trap. If `backup` doesn't exist yet,
`cp config/nginx.conf backup` doesn't complain: it creates a **file** named
`backup` that is a copy of nginx.conf. Writing the directory with a slash at the end,
`backup/`, protects you: if the directory is missing, `cp` stops with an error
instead. <!-- TODO-REVIEW: GNU cp with a trailing-slash destination that doesn't exist fails ("Not a directory") rather than creating a file. Verified on this VM; true for GNU coreutils generally? -->

Two more things to know:

- `cp` silently **overwrites** a file that already has the target name. `cp -i`
  asks first.
- To copy a whole directory with everything in it, add `-r` (*recursive*):
  `cp -r config config-backup`.
