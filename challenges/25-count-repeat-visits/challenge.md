---
id: count-repeat-visits
title: "Count repeat visits"
module: incident
concept: "Counting adjacent repeated lines"
introduces: ["uniq"]
reuses: ["sort", "|", ">"]
check: state
---

## Story

Now count how many requests came from each visitor. This fresh machine has the same unsorted `~/access.log`; it does not contain the sorted file you made in the previous challenge.

## Goal

Create `~/visit-counts.txt` with one record per address: its request count followed by the address. Include every address once and keep `~/access.log` unchanged.
Row order and spaces between the count and address do not matter here.

## Hint 1

First put matching addresses together. Then count each consecutive group.

## Hint 2

`uniq -c` replaces each run of equal neighbouring lines with one line prefixed by its count. It does not collect matches from different places in an unsorted file. Feed it sorted output with a pipe.

## Hint 3

Run `sort ~/access.log | uniq -c > ~/visit-counts.txt`. Each output row should contain a count and an address, with no address appearing twice.

## Explanation

**uniq** compares neighbouring lines. Its **`-c`** option counts each run:

```sh
sort ~/access.log | uniq -c > ~/visit-counts.txt
```

The sort step is essential for counting all requests from each address together. Without it, the same visitor can appear on several rows with separate counts.

GNU uniq aligns counts with leading spaces. Those spaces are formatting, not part of the number. This task accepts other spacing and any row order, provided all the counts are right.
