---
id: names-with-spaces
title: "That name has spaces"
module: find-your-way
concept: "Quoting a filename"
introduces: ["quoting"]
reuses: ["cp", "ls", "~"]
check: state
---

## Story

Two reports are in `~/reports`: `Q3 report.txt` and `Q3 report (old).txt`.
The team needs a backup of the current report, not the old one. The backup folder already exists.

## Goal

Copy `~/reports/Q3 report.txt` to `~/backup/Q3 report.txt`. Make an independent copy and leave both source reports unchanged.

## Hint 1

Spaces normally separate arguments. Keep the complete filename together so cp receives one source name.

## Hint 2

Put quotes around each path containing spaces. For example, `cp "source name.txt" "destination name.txt"` uses two names, not four.

## Hint 3

Run `cp ~/reports/"Q3 report.txt" ~/backup/"Q3 report.txt"`. Check the destination with `ls ~/backup`. Read the whole filename before pressing Enter.

## Explanation

Bash normally treats unquoted spaces as separators between arguments. Quotes keep the spaces inside an argument:

```sh
cp ~/reports/"Q3 report.txt" ~/backup/"Q3 report.txt"
```

The quotes are instructions to Bash; they are not part of the filename passed to cp. Both single and double quotes protect spaces. Another spelling is `Q3\ report.txt`, with each space escaped by a backslash.

Keep `~` outside the quotes, as above. An unquoted `~/` expands to your home directory; `"~/reports/Q3 report.txt"` keeps the tilde literal.

Quotes do not choose the correct file for you. The similarly named old report is still a different file.
