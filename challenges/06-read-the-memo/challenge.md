---
id: read-the-memo
title: Read the memo
module: find-your-way
concept: Reading long files
introduces: [less]
reuses: [cat, ls]
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

`ls` shows the file is there. `cat` would show it, but the file is long and would
rush past. A program that lets you scroll and search will help.

## Hint 2

`less handbook.txt` opens the file in a viewer. While it's open, your keys control the
viewer: <kbd>Space</kbd> for the next page, `/` followed by a word and <kbd>Enter</kbd>
to search, and <kbd>q</kbd> to quit back to the command prompt.

## Hint 3

Run `less handbook.txt`, type `/Wi-Fi` and press <kbd>Enter</kbd>. The first matches are
in the section about the **old** network: keep pressing <kbd>n</kbd> (next match) until
you reach section 7. Note the password, then press <kbd>q</kbd>.

## Explanation

`cat handbook.txt` prints the whole file at once: everything rushes past and you're
left at the end.

**`less`** opens a file in a viewer you can move around in, one screen at a time. Reading it with `less`
doesn't change the file.

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
