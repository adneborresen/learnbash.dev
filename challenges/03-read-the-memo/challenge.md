---
id: read-the-memo
title: Read the memo
module: first-day
concept: Reading files
introduces: [cat, less]
reuses: [ls]
check: answer
answer_label: Current Wi-Fi password
expected_answer: maple-otter-42
---

## Story

Your laptop needs the office Wi-Fi. A colleague shrugs:

> It's in the handbook. `handbook.txt`, in your home directory. Somewhere.
> Careful, that thing is long, and it still has the old network in it.

## Goal

Find the **current** Wi-Fi password in `handbook.txt` and type it into the answer box.

## Hint 1

`ls` shows the file is there. Now you need a command that shows what's *inside* a
file. Since the file is long, a program that lets you scroll and search will help.

## Hint 2

`less handbook.txt` opens the file in a viewer. Press <kbd>Space</kbd> for the next
page and <kbd>q</kbd> to quit. Type `/` followed by a word and <kbd>Enter</kbd> to
search for it.

## Hint 3

Run `less handbook.txt`, type `/Wi-Fi` and press <kbd>Enter</kbd>. The first match is
the **old** network: press <kbd>n</kbd> to jump to the next match. Note the password,
then press <kbd>q</kbd>.

## Explanation

**`cat`** prints a whole file to the terminal: `cat handbook.txt`. That's perfect for
short files. For a long one, everything scrolls past and you only see the end.
(The name comes from *concatenate*: `cat a.txt b.txt` prints both files, one after the
other.)

**`less`** opens a file in a viewer you can move around in. It never changes the file.

| Key | Does |
|---|---|
| <kbd>Space</kbd> / <kbd>b</kbd> | next / previous page |
| <kbd>↓</kbd> / <kbd>↑</kbd> | one line down / up |
| `/word` then <kbd>Enter</kbd> | search forward for *word* |
| <kbd>n</kbd> / <kbd>N</kbd> | next / previous match |
| <kbd>g</kbd> / <kbd>G</kbd> | jump to the start / end |
| <kbd>q</kbd> | quit |

Searching is case-sensitive by default: `/wi-fi` would not find `Wi-Fi`. Start less
with `less -i handbook.txt` to ignore case when you search in lowercase.

Many other programs use the same keys. For example, `man ls` shows the manual page
for `ls` in the same kind of viewer. (`man` isn't installed on this practice machine,
to keep it small.)

The lesson of the old network: the first match isn't always the right one. Read
the text around what you find.
