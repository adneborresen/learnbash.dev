---
id: ask-for-help
title: "Ask the command"
module: find-your-way
concept: "Discovering an option with --help"
introduces: ["--help"]
reuses: ["cat"]
check: answer
answer_label: "Line number"
expected_answer: "7"
---

## Story

A colleague needs the line number of `Owner: Morgan` in `~/rota.txt`, counting blank lines too.
You know how to read the file. Can cat put a number beside every line? Its built-in help lists its options.

## Goal

Read `cat --help` to find the option that numbers **all** output lines. Use it on `~/rota.txt` and enter the line number of `Owner: Morgan`.
The help may scroll above the terminal. Scroll back with your mouse or swipe down inside the terminal on a phone. You do not need to fit the help on one screen.

## Hint 1

Look in the help for “number all output lines”, not just nonempty lines. An option changes how a command behaves.

## Hint 2

Run `cat --help`. The short option on the “number all output lines” row goes before the filename: `cat OPTION ~/rota.txt`. Replace OPTION with what you found.

## Hint 3

Run `cat -n ~/rota.txt`. Read the number beside `Owner: Morgan`, including the blank lines in the count. Submit only that number.

## Explanation

Many GNU commands print a short guide when you add **`--help`**. It lists their options and how to supply filenames. This is useful on this machine, where `man` is unavailable.

For cat, `-n` (also `--number`) numbers every output line, including blank ones. `-b` numbers only nonempty lines, so it would answer a different question.

An option and a filename are separate arguments: `cat -n rota.txt`. The numbers are added to the displayed output; the file itself is unchanged.

`--help` is common, not universal. For Bash builtins such as `cd`, you can also use `help cd`. You do not need that for this exercise.
