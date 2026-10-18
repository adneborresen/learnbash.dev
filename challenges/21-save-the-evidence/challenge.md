---
id: save-the-evidence
title: "Save the evidence"
module: incident
concept: "Saving output with >"
introduces: [">"]
reuses: ["grep", "cat", "~"]
check: state
---

## Story

The incident team needs a file containing the checkout errors. Printing them in your terminal is useful for you, but a saved file can be handed over.

## Goal

Save every line containing uppercase `ERROR` from `~/logs/app.log` into `~/errors.txt`, in the same order as the source. Keep the original log unchanged.

## Hint 1

You already know how to select the errors. Tell the shell where to send that command's output.

## Hint 2

`COMMAND > FILE` sends normal output into FILE instead of showing it in the terminal. It creates the destination or replaces its contents. Use a different destination from the source log.

## Hint 3

Run `grep ERROR ~/logs/app.log > ~/errors.txt`. Check the saved file with `cat ~/errors.txt`. Repeating the same command replaces the output with the same evidence.

## Explanation

**`>`** redirects a command's standard output. Bash opens the destination before running the command, creating it or emptying an existing file. Successful redirection often leaves the terminal quiet.

```sh
grep ERROR ~/logs/app.log > ~/errors.txt
```

Never use the input file as the destination: `cat notes.txt > notes.txt` empties notes.txt before cat reads it. There is no undo here; Reset restores the exercise's original files.

Error messages normally use a separate stream and still appear in the terminal. This exercise saves the matching log records, not the command's error messages.
