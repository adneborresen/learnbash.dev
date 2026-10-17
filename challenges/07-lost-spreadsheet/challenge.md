---
id: lost-spreadsheet
title: The lost spreadsheet
module: first-day
concept: Finding files by name
introduces: [find, quoting]
reuses: [cp, "*", cd]
check: state
---

## Story

The accountant is on the phone, slightly panicked:

> I need `budget_2024.csv` for a meeting in ten minutes! It's somewhere in
> `~/documents`, but there are folders inside folders inside folders. Could you
> copy it to your home directory and send it over?

## Goal

Find `budget_2024.csv` somewhere inside `~/documents` and **copy** it into your home
directory, so that `~/budget_2024.csv` exists. Leave the original where it is.

## Hint 1

Clicking through every folder with `cd` and `ls` would take a while. There's a
command that searches through a directory and all the directories inside it.

## Hint 2

`find documents -name budget_2024.csv` searches `documents` and everything below it,
and prints the path of each file with that name.

## Hint 3

Run `find documents -name budget_2024.csv` from your home directory. Then copy the
path it prints: `cp PATH ~/`. Pressing <kbd>Tab</kbd> while you type the path helps.

## Explanation

**`find`** searches a directory and all its subdirectories:

```
find WHERE -name PATTERN
```

`find documents -name budget_2024.csv` prints every matching path, for example
`documents/finance/2024/q4/budget_2024.csv`. With `.` as *WHERE*, it searches the
current directory.

The pattern can use the wildcards you know. Find every CSV file:

```
find documents -name '*.csv'
```

**Quote the pattern!** Remember that the *shell* expands wildcards before the
command runs. Your home directory contains `contacts.csv`. If you run
`find documents -name *.csv` there, Bash first turns it into
`find documents -name contacts.csv`, and find only looks for files named
`contacts.csv`. With quotes (`'*.csv'`), the shell leaves the `*` alone, and find
does the matching itself. If several files match in the current directory, find gets
several names and stops with an error instead:

```
find: paths must precede expression: `revenue.csv'
find: possible unquoted pattern after predicate `-name'?
```

Useful extras:

| Option | Does |
|---|---|
| `-iname` | like `-name`, but ignores upper/lower case |
| `-type f` / `-type d` | only files / only directories |

They combine: `find . -type d -name '2024'` finds directories named `2024`.

Searching from `/` (the whole system) works too, but you'll see many
`Permission denied` lines for folders your user isn't allowed to read.
