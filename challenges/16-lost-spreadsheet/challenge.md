---
id: lost-spreadsheet
title: The lost spreadsheet
module: incident
concept: Finding files by name
introduces: [find]
reuses: [cp, "*", cd, quoting]
check: state
---

## Story

Checkout requests on the website are failing. Before inspecting the logs, the
incident team needs the current server inventory:

> Find `server-inventory_2026.csv` somewhere in `~/documents` and copy it to your
> home directory. Watch out for a draft and last year's inventory.

## Goal

Find `server-inventory_2026.csv` somewhere inside `~/documents` and **copy** it into your home
directory, so that `~/server-inventory_2026.csv` exists. Leave the original where it is.

## Hint 1

Clicking through every folder with `cd` and `ls` would take a while. There's a
command that searches through a directory and all the directories inside it.

## Hint 2

`find ~/documents -name server-inventory_2026.csv` searches your documents folder and everything below it,
and prints the path of each file with that name.

## Hint 3

Run `find ~/documents -name server-inventory_2026.csv`; this works from any directory. Then copy the
file: `cp PATH ~/`, replacing PATH with the path find printed. Pressing <kbd>Tab</kbd>
while typing a path completes folder names for you.

## Explanation

**`find`** searches a directory and all its subdirectories:

```
find WHERE -name PATTERN
```

`find documents -name server-inventory_2026.csv` prints every matching path, for example
`documents/operations/2026/q4/server-inventory_2026.csv`. With `.` as *WHERE*, it searches the
current directory.

The pattern can use the wildcards you know. Find every CSV file:

```
find documents -name '*.csv'
```

**Quote the pattern!** The *shell* expands unquoted wildcards before the
command runs. At the start of this exercise, your home directory contains just one
CSV file, `contacts.csv`. An unquoted `*.csv` there would become `contacts.csv`,
so find would search for that name instead of all CSV files.

After copying the inventory home, there are two matching names. An unquoted
`*.csv` then gives find an extra argument and it reports an error. With quotes
(`'*.csv'`), Bash leaves the `*` alone and find does the matching inside the
search directory itself.

Useful extras:

| Option | Does |
|---|---|
| `-iname` | like `-name`, but ignores upper/lower case |
| `-type f` / `-type d` | only files / only directories |

They combine: `find . -type d -name '2026'` finds directories named `2026`.

Searching from `/` (the whole system) works too, but you'll see many
`Permission denied` lines for folders your user isn't allowed to read.
