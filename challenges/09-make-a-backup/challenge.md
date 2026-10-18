---
id: make-a-backup
title: Make a backup
module: find-your-way
concept: Copying files
introduces: [cp]
reuses: [mkdir, ls, cd]
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

First make the folder, as in the last challenge. Then you need a command to **c**o**p**y files.

## Hint 2

`mkdir backup` creates the folder (run it in your home directory). `cp FILE FOLDER/`
copies a file into a folder: replace FILE and FOLDER with real names, e.g.
`cp config/app.conf backup/`.

## Hint 3

In your home directory, run:
`mkdir backup` (skip it if the folder exists already), then
`cp config/nginx.conf config/app.conf backup/`. The destination always comes last.
Check the result with `ls backup`.

## Explanation

**`cp`** (*copy*) copies files. It works in two ways:

- `cp SOURCE NEWNAME` makes a copy under a new name: `cp app.conf app.conf.bak`
- `cp FILE1 FILE2 ... DIRECTORY` copies files *into* an existing directory, keeping
  their names: `cp config/nginx.conf config/app.conf backup/`

That double meaning is a classic trap. If `backup` doesn't exist yet,
`cp config/nginx.conf backup` doesn't complain: it creates a **file** named
`backup` that is a copy of nginx.conf. Writing the directory with a slash at the end,
`backup/`, protects you: if the directory is missing, `cp` stops with an error
instead of creating a file.
<!-- Reviewed: POSIX pathname resolution requires a trailing-slash path to name
an existing directory or one being created as a directory:
https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap04.html#tag_04_16
Confirmed with GNU coreutils 9.7 in the bundled VM: a regular-file copy to a
missing backup/ exits 1 without creating backup; cp -R can create the directory. -->

Two more things to know:

- `cp` silently **overwrites** a file that already has the target name. `cp -i`
  asks first.
- To copy a whole directory with everything in it, add `-r` (*recursive*):
  `cp -r config config-backup`.
