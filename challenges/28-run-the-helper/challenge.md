---
id: run-the-helper
title: "Run the helper"
module: incident
concept: "Running a program in the current directory"
introduces: ["./"]
reuses: ["permissions", "ls -l", "cat", "cd", "~"]
check: state
---

## Story

The team supplied `~/deploy.sh` for a local recovery rehearsal. Its owner already has permission to read and execute it. Running it writes a result file inside this practice machine; it does not deploy a real website.

## Goal

Run the supplied helper and produce `~/deployed.txt` containing its complete rehearsal result. Keep the contents of `~/deploy.sh` unchanged.

## Hint 1

Reading a script displays its text. To perform its actions, run it as a program.

## Hint 2

From your home directory, `./deploy.sh` runs the file named deploy.sh in the current directory. The `./` is part of its path.

## Hint 3

Run `cd ~`, then `./deploy.sh`. Read the result with `cat ~/deployed.txt`. The helper is safe to run again: it replaces the same result file.

## Explanation

**`./`** means “in the current directory”. `./deploy.sh` gives Bash a path to the program to execute.

For an external command name without a slash, Bash normally searches the directories in `PATH`. This machine does not include the current directory there, so typing only `deploy.sh` will not find this local file.

This script already has owner read and execute permissions. Its first line, `#!/bin/bash`, names the interpreter that runs it. You do not need to write a script yet.

The check verifies the unchanged helper and the saved result. It cannot prove which spelling you used to run it; an absolute path or `bash deploy.sh` can also produce the result.
