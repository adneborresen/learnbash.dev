---
id: incident-handover
title: "Review: hand over the incident"
module: incident
concept: "Review: investigating and reporting"
introduces: []
reuses: ["mkdir", "grep", "|", "sort", "uniq", "sort -nr", ">", ">>", "echo", "quoting"]
check: state
---

## Story

Your shift on the checkout incident is ending. The next person needs the error evidence and a ranked visitor summary. All source data is provided again on this fresh machine.

## Goal

Create `~/handover` with two files:

- `errors.txt`: every uppercase `ERROR` line from `~/logs/app.log`, in source order, followed by exactly one `END OF REPORT` line.
- `visitors.txt`: one request count and address per line, covering every address in `~/access.log`, ranked from largest count to smallest. Spaces or tabs between the count and address are fine.

Keep both source logs unchanged. Include repeated requests in the counts, and put nothing after the report's end marker.

## Hint 1

There are two independent outputs: selected error evidence and a ranked visitor summary. Both belong inside the handover folder.

## Hint 2

Count every request, even when the same address appears at different places in the original log. Each visitor should have only one row in the summary.

## Hint 3

Check the report's first and last records, its single end marker, and the ranking of all visitor counts. The two original source logs must still be intact.

## Explanation

This review combines selecting records, saving output, appending a marker, grouping equal lines, counting groups, and ranking numeric values.

The same data can answer different questions. The error report preserves the order of events; the visitor summary deliberately changes order to rank activity. Neither task should change the original evidence.

A complete handover is useful to the next person without requiring them to repeat your investigation. The counts identify where to investigate next, not a verdict about a visitor.
