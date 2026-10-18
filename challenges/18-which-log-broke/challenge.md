---
id: which-log-broke
title: Which log broke?
module: incident
concept: Searching inside files
introduces: [grep, "grep -l", "grep -r"]
reuses: [cd, "*"]
check: answer
answer_label: Name of the log file
expected_answer: web-06.log
---

## Story

Last night, customers saw a **503 Service Unavailable** error on the website. The
logs from all eight web servers are in `~/incident`. Your manager wants to know:

> Which server logged `ERROR 503`? Just give me the log file's name.

## Goal

Find the log file in `~/incident` that contains the text `ERROR 503`, and type its
name into the answer box.

## Hint 1

Opening eight files one by one would work, but there's a command that searches for
text inside files and prints the lines that match.

## Hint 2

`grep "ERROR 503" FILES` prints every line that contains `ERROR 503`. You can give it
all the logs at once with a wildcard: `*.log`. The quotes keep `ERROR 503` together as
one search phrase.

## Hint 3

Run `cd incident`, then `grep "ERROR 503" *.log`. Each matching line starts with the
name of the file it came from. (`grep -l` prints only the file names.)

## Explanation

**`grep`** searches for text in files and prints the lines that contain it:

```
grep PATTERN FILE...
```

With more than one file, each line starts with the file name:

```
$ grep "ERROR 503" *.log
web-06.log:2026-10-16 23:41:07 ERROR 503 Service Unavailable (upstream timeout)
```

**Quotes matter here too.** `grep ERROR 503 *.log` (without quotes) means: search
for `ERROR` in the files `503`, `web-01.log`, …, so you get
`grep: 503: No such file or directory`. The quotes make `ERROR 503` one argument.

Handy options:

| Option | Does |
|---|---|
| `-l` | print only the **names** of files that match |
| `-i` | ignore upper/lower case |
| `-n` | show line numbers |
| `-c` | count matching lines per file |
| `-v` | print lines that do **not** match |
| `-r` | search **recursively** through a directory: `grep -r "ERROR 503" ~/incident` |

The pattern is actually a *regular expression*, a small language for describing
text. For plain words and numbers like here, you don't need to know anything about
that yet.

**Exit status.** Every command reports success or failure with a number, its *exit
status*: `0` means success. grep returns `0` if it found something, `1` if it found
nothing, and `2` if there was an error (such as a missing file). Bash keeps the last
exit status in `$?`, so `echo $?` shows it. Scripts use this to decide what to do
next.
