---
id: count-the-lines
title: "How long is this log?"
module: incident
concept: "Counting lines with wc -l"
introduces: ["wc"]
reuses: ["~"]
check: answer
answer_label: "Number of log lines"
expected_answer: "500"
---

## Story

Before narrowing down the checkout incident, the team wants to know how many records are in `~/logs/app.log`. Each record occupies one line.

## Goal

Count all the lines in `~/logs/app.log` and enter just the number. The log ends with a newline after its last record.

## Hint 1

Use a command that counts text rather than counting screenfuls. Make sure you ask for lines, not words or bytes.

## Hint 2

`wc` counts text. The option `-l` (lowercase L) selects the line count: `wc -l FILE`.

## Hint 3

Run `wc -l ~/logs/app.log`. It prints a number and the filename. Submit only the number.

## Explanation

**wc** counts different aspects of text:

| Option | Counts |
|---|---|
| `-l` | newline characters |
| `-w` | words |
| `-c` | bytes |

This log ends every record with a newline, so `wc -l` gives the number of records. A final piece of text without a terminating newline would not add to that count.

When you give wc a filename, it prints the count followed by that name. The answer box asks for the count alone.
