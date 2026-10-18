---
id: top-visitor
title: "Top visitor"
module: incident
concept: "Ranking counts numerically, largest first"
introduces: ["sort -nr"]
reuses: ["sort", "head"]
check: answer
answer_label: "IP address"
expected_answer: "203.0.113.42"
---

## Story

The visitor counts are ready in `~/visit-counts.txt`. This export writes counts without alignment spaces. The incident team wants to investigate the visitor with the most requests.

## Goal

Find the address with the highest request count in `~/visit-counts.txt` and submit just that address.

## Hint 1

These are counts, so compare their numeric values. Text ordering would put a count of 9 ahead of 40 when reversed.

## Hint 2

`sort -n` compares the numbers at the beginning of lines. `-r` reverses the order so the largest comes first. Together they are `sort -nr`.

## Hint 3

Run `sort -nr ~/visit-counts.txt`. The first line has the highest count. Submit its address, without the count. You can also use the head command you already know to inspect the start of the output.

## Explanation

**`sort -nr`** sorts by numeric value (`-n`) in reverse order (`-r`), giving the largest count first.

Plain text sorting compares characters. In this unpadded export, a line starting with `9` comes after one starting with `40` in ascending byte order. Reversing that text order would give the wrong leader.

GNU `uniq -c` normally pads its counts with spaces. For these small counts that alignment can make plain text sorting happen to agree with numeric sorting. Do not rely on that formatting: numeric sorting expresses what you intend.

The full analysis of raw requests is now made of familiar steps:

```sh
sort access.log | uniq -c | sort -nr | head -n 1
```

A high request count is a clue to investigate; it does not by itself prove abusive traffic.
