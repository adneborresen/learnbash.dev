---
id: the-interns-logs
title: The intern's 300 logs
module: first-day
concept: Wildcards match many files at once
introduces: ["*", "?"]
reuses: [mv, mkdir, ls, cd]
check: state
---

## Story

The summer intern saved a log file for every hour of testing, straight into
`~/logs`. All **300** of them. The two notes in there, `README.txt` and `todo.txt`,
are drowning.

> Please move all the `.log` files into a new folder, `~/logs/archive`. Leave the
> `.txt` files where they are.

Moving 300 files one by one? There's a better way.

## Goal

Create the directory `~/logs/archive` and move **all** `.log` files from `~/logs`
into it. `README.txt` and `todo.txt` must stay in `~/logs`.

## Hint 1

The shell can stand in for "every file whose name ends in `.log`". The special
character for "any text" is `*`.

## Hint 2

`*.log` means "every name that ends in `.log`". Try `ls *.log` inside `~/logs` to see
what it matches before you move anything.

## Hint 3

Run `cd logs`, then `mkdir archive`, then `mv *.log archive/`. Check with `ls` and
`ls archive`.

## Explanation

Characters like `*` are **wildcards** (also called *glob patterns*):

| Pattern | Matches | Example |
|---|---|---|
| `*` | any text, including none | `*.log` → `web-001.log`, `web-300.log` |
| `?` | exactly one character | `web-00?.log` → `web-001.log` … `web-009.log` |
| `[abc]` | one of these characters | `web-00[12].log` → `web-001.log`, `web-002.log` |

The most important thing to understand: **the shell expands the pattern, not the
command.** Before `mv` even starts, Bash replaces `*.log` with the list of matching
names. `mv` simply receives 300 file names, followed by `archive/`. That's why the same
wildcards work with every command: `ls`, `cp`, `rm` and the rest.

So you can **preview** what a pattern matches with `echo` or `ls`:

```
$ echo web-00?.log
web-001.log web-002.log web-003.log web-004.log web-005.log web-006.log web-007.log web-008.log web-009.log
```

Do that before using a pattern with `rm`!

Why not `mv * archive/`? Because `*` matches **everything**, including the `.txt`
files and even `archive` itself (`mv` complains that it can't move a directory
into itself).

Two details:

- `*` does not match names that start with a dot (hidden files).
- If nothing matches, Bash passes the pattern on unchanged, so you see errors like
  `ls: cannot access '*.xyz': No such file or directory`.
