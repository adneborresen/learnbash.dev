---
id: first-and-last-lines
title: "Read the beginning and end"
module: incident
concept: "Reading the boundaries of a file"
introduces: ["head", "tail"]
reuses: ["~"]
check: answer
answer_label: "Final incident status"
expected_answer: "INVESTIGATING"
---

## Story

The inventory is ready. Now open the incident's timeline: `~/logs/app.log`.
It records a checkout outage from its opening through the latest update. A separate `app-previous.log` describes an older incident.

## Goal

Inspect the beginning and end of `~/logs/app.log`. Enter the **final incident status** from that file, exactly as written in capitals.

## Hint 1

You do not need to read all 500 lines. Two commands show the beginning or end of a file.

## Hint 2

`head -n 3 FILE` shows its first three lines; `tail -n 3 FILE` shows its last three. Replace FILE with `~/logs/app.log`. Compare the opening status with the latest one.

## Hint 3

Run `head -n 3 ~/logs/app.log`, then `tail -n 3 ~/logs/app.log`. Submit the status from the last line of the current log, not its opening status or the previous incident's status.

## Explanation

**head** shows the beginning of a file; **tail** shows the end. Both show ten lines by default. `-n 3` selects three lines instead.

Logs usually record events in time order. Here, the opening and final statuses differ, so reading only the beginning would give an outdated answer.

These commands only read the file. Each exercise restores its own incident evidence; nothing needs to be carried over from the previous machine.
