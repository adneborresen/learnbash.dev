---
id: put-lines-in-order
title: "Put matching lines together"
module: incident
concept: "Sorting lines"
introduces: ["sort"]
reuses: [">", "cat"]
check: state
---

## Story

The incident team exported one visitor address per request to `~/access.log`.
Requests from the same visitor are scattered through the file. Put identical addresses next to each other before counting them.

## Goal

Save every line of `~/access.log`, sorted in this machine's byte order, to `~/sorted-visits.txt`. Keep repeated addresses: each line represents one request. Leave the source unchanged.

## Hint 1

Sorting puts identical lines together. It should change the order, not how many records you have.

## Hint 2

`sort FILE` prints the lines in order. Combine it with `>` to save a separate result file.

## Hint 3

Run `sort ~/access.log > ~/sorted-visits.txt`. Check with `cat ~/sorted-visits.txt`. Do not use access.log as the destination.

## Explanation

**sort** reads lines and prints them in order. It keeps duplicates by default: if an address occurs forty times, forty copies remain.

```sh
sort ~/access.log > ~/sorted-visits.txt
```

The order here compares bytes, not the numeric value of an IP address. That is enough to bring identical addresses together. Other systems' locale settings can change text ordering.

Sorting is separate from removing duplicates. Removing requests now would destroy the evidence needed to count each visitor.
