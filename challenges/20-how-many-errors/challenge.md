---
id: how-many-errors
title: How many errors?
module: incident
concept: Connecting commands with a pipe
introduces: ["|"]
reuses: [grep, wc, "Ctrl+C"]
check: answer
answer_label: Number of ERROR lines
expected_answer: "71"
---

## Story

The checkout incident's log, `~/logs/app.log`, has 500 records, but only some are errors.
The team lead asks:

> How many lines in there are errors? Lines with `ERROR` on them. I need a number.

## Goal

Count how many lines in `~/logs/app.log` contain `ERROR` (in capitals), and type the
number into the answer box.

## Hint 1

You already know how to *show* the ERROR lines with `grep`. You have also counted lines with `wc -l`. Now connect those two operations.

## Hint 2

`wc -l` counts lines. The `|` character (the *pipe*) sends the output of one command
into the next: `COMMAND1 | COMMAND2`. (Typed on its own, `wc -l` waits for you to type
text. Press <kbd>Ctrl</kbd>+<kbd>C</kbd> to get your prompt back.)

## Hint 3

Run `grep ERROR logs/app.log | wc -l`. The number it prints is your answer.

## Explanation

The **pipe**, `|`, connects two commands: the output of the left one becomes the
input of the right one.

```
$ grep ERROR logs/app.log | wc -l
71
```

grep doesn't print its lines on the screen here: they flow straight into `wc`.
You can chain as many commands as you like, and that's the core idea of the command
line: many small tools, each doing one job well, combined with pipes.

**`wc`** (*word count*) counts:

| Option | Counts |
|---|---|
| `-l` | lines |
| `-w` | words |
| `-c` | bytes |

Without a pipe, give it a file: `wc -l logs/app.log` prints the count and the file
name (`500 logs/app.log`). Reading from a pipe, there's no file name to show, so it
prints only the number.

**A shortcut:** `grep -c ERROR logs/app.log` counts the matching lines by itself.
The pipe version is worth knowing because it works with *any* command's output.

Watch out for two easy mistakes:

- `grep -i error` also matches lines that say `error` in lowercase. In this log, the
  `WARN` lines mention an "error rate", so you'd get too many.
- `wc -w` counts **words**, not lines.

Both `grep -c` and `grep | wc -l` count **lines**. A line with `ERROR` twice still
counts once.
