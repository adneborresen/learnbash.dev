---
id: top-visitor
title: Top visitor
module: first-day
concept: Sorting and counting lines
introduces: [sort, uniq, head]
reuses: ["|"]
check: answer
answer_label: IP address
expected_answer: 203.0.113.42
---

## Story

The website is slow, and the team suspects a single visitor is hammering it.
The firewall exported the IP address of every recent request to
`~/access.log`, one per line.

> Which IP address shows up most often? That's the one we'll block.

## Goal

Find the IP address that appears **most often** in `~/access.log` and type it into
the answer box.

## Hint 1

Counting by hand is hopeless. If the file were *sorted*, identical addresses would
sit next to each other, and there's a command that counts runs of identical lines.

## Hint 2

`sort access.log | uniq -c` prints each address once, with how often it occurs. Sort
*that* output by the numbers to find the biggest: `sort -n` sorts numerically, `-r`
reverses.

## Hint 3

Run `sort access.log | uniq -c | sort -rn | head -n 3`. The top line has the highest
count; its IP address is your answer.

## Explanation

This pipeline is a classic. Read it left to right:

```
sort access.log | uniq -c | sort -rn | head -n 3
```

1. **`sort`** puts the lines in order, so identical lines end up next to each other.
2. **`uniq -c`** collapses each run of identical lines into one, prefixed by a
   count: `40 203.0.113.42`.
3. **`sort -rn`** sorts those lines by the number (`-n`, *numeric*), biggest first
   (`-r`, *reverse*).
4. **`head -n 3`** keeps only the first 3 lines (without `-n`, `head` shows 10).
   Its partner **`tail`** shows the *last* lines.

**Why sort first?** `uniq` only merges identical lines that are **next to each
other**. On the unsorted file, `uniq -c` counts each address in separate small
pieces. In this log, one address made 25 requests in a row, so without `sort` it
looks like the top visitor, but the real one made 40 requests spread out over time.

**Why `-n`?** Without it, `sort` compares text character by character, so `9`
comes after `10` (because the character `9` comes after `1`). `-n` compares the
values as numbers.

`sort` has more useful options: `-u` removes duplicates, `-k` sorts by a chosen
column (`sort -k2` sorts by the second column onwards; columns are separated by
spaces). Keep in mind that the alphabetical order of
text can depend on your system's language settings (the *locale*). On this machine,
sort uses plain byte order: uppercase before lowercase.
