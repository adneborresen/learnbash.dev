---
id: say-it-clearly
title: "Write a status message"
module: incident
concept: "Printing text with echo"
introduces: ["echo"]
reuses: ["quoting", ">", "cat"]
check: state
---

## Story

The team has the error evidence. Add a short status file so the next person can tell that the investigation is still in progress.

## Goal

Create `~/status.txt` containing exactly one line:

```text
Checkout investigation in progress
```

## Hint 1

Instead of reading text from another file, use a command that prints the words you supply. Then save that output.

## Hint 2

`echo "some text"` prints that text followed by a newline. Combine it with the redirection you just practised.

## Hint 3

Run `echo "Checkout investigation in progress" > ~/status.txt`, then `cat ~/status.txt`. If the file already contains the correct line, it is ready.

## Explanation

**echo** prints its arguments, normally separated by spaces and followed by a newline. Here quotes keep the sentence together, and `>` saves the printed line.

```sh
echo "Checkout investigation in progress" > ~/status.txt
```

The destination filename belongs after `>`. Putting it inside the quoted text would print the filename into the file.

Bash has its own built-in echo. Ordinary text like this works as shown; options and backslash escapes have additional rules that we do not need here.
