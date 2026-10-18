---
id: write-the-report
title: Write the report
module: incident
concept: Saving output to a file
introduces: [">", ">>", echo]
reuses: [grep, cat]
check: state
---

## Story

The team lead wants last night's errors in writing:

> Put all the ERROR lines from `~/logs/app.log` into `~/report.txt`. Then add a last
> line that says exactly `END OF REPORT`, so I know nothing got cut off.

## Goal

Create `~/report.txt` containing every line of `~/logs/app.log` that contains
`ERROR`, followed by one final line: `END OF REPORT`.

## Hint 1

The output a command would print on the screen can be saved into a file instead. The
`>` character does that. To add something *without* replacing what's already in the
file, there's a doubled version.

## Hint 2

`grep ERROR logs/app.log > report.txt` saves the ERROR lines. `echo "some text"`
prints a line of text; `>>` adds output to the **end** of a file.

## Hint 3

From your home directory, run `grep ERROR logs/app.log > report.txt`, then
`echo "END OF REPORT" >> report.txt`. Check with `cat report.txt`.

## Explanation

Normally a command's output goes to the terminal. **Redirection** sends it into a
file instead:

| Syntax | Does |
|---|---|
| `COMMAND > FILE` | write the output to FILE: creates it, or **replaces** its contents |
| `COMMAND >> FILE` | **append** the output to the end of FILE (creates it if needed) |

**`echo`** prints its arguments, which makes it handy for writing a line of text:
`echo "END OF REPORT" >> report.txt`.

The classic mistake is using `>` twice:

```
grep ERROR logs/app.log > report.txt
echo "END OF REPORT" > report.txt      # oops: replaces the ERROR lines!
```

The second `>` empties the file before `echo` writes its line. No warning, no undo.

That emptying happens even before the command runs, which leads to a famous
trap: `sort names.txt > names.txt` leaves you with an **empty** file, because
the shell empties `names.txt` before `sort` gets to read it. Write to a new file
instead.

Redirection works with any command. `ls > files.txt` saves a listing, and a
pipeline can end in a file: `grep ERROR app.log | sort > sorted-errors.txt`.

Error messages are separate from normal output, so `>` doesn't capture them:
they still appear on the screen. To save them, use `2>`:
`find / -name '*.conf' 2> errors.txt`.
