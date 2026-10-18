---
id: read-the-welcome-note
title: Read your first note
module: find-your-way
concept: Showing what's inside a file
introduces: [cat]
reuses: [ls, cd, relative path]
check: answer
answer_label: Locker code
expected_answer: "4721"
---

## Story

Your manager left you a welcome note:

> Welcome aboard! Everything you need for your first day is in `welcome.txt`, in the
> `notes` folder in your home directory. Including the code for your locker.

## Goal

Read `~/notes/welcome.txt` and type your locker code into the answer box.

## Hint 1

`ls notes` shows what's in the folder. Now you need a command that shows what's
*inside* a file.

## Hint 2

`cat FILE` prints the contents of a file. Replace FILE with the file's path, starting
from where you are.

## Hint 3

From your home directory, run `cat notes/welcome.txt` and look for the line about your
locker. Type just the code (the digits) into the answer box.

## Explanation

**`cat`** prints a whole file to the terminal: `cat notes/welcome.txt`. It doesn't change
the file; it only shows it. Like `cd`, it takes a path, so `cat ~/notes/welcome.txt` works
from anywhere.

The name comes from *concatenate* (join together): `cat a.txt b.txt` prints both files,
one after the other.

`cat` is perfect for short files. A long file rushes past and you're left looking at
the end of it. The next challenges show what to do then.

If you see `No such file or directory`, check the path: `ls` shows what's really there,
and <kbd>Tab</kbd> completes names for you. If you see `Is a directory`, you gave `cat` a
folder; `cat` reads files, `ls` lists folders.

There was a second note, `welcome-2025.txt`, with an older code. The file name often tells
you which file is current, so look at what `ls` shows before you open one.
