---
id: write-the-report
title: "Write the report"
module: incident
concept: "Appending output with >>"
introduces: [">>"]
reuses: [">", "echo", "cat", "grep"]
check: state
---

## Story

The error report has already been prepared in `~/report.txt`. The team lead needs one final marker so it is clear where the report ends.

## Goal

Keep all 71 error records already in `~/report.txt`, in their current order, and add exactly one final line:

```text
END OF REPORT
```

Keep the source `~/logs/app.log` unchanged. There must be nothing after the marker.

## Hint 1

A single redirection arrow replaces a file. You need the form that adds output after its existing contents.

## Hint 2

`>>` appends output to the end of a file. Use echo to print the marker. Read the report first; if the marker is already its final line, do not add it again.

## Hint 3

Run `cat ~/report.txt`. If the marker is missing, run `echo "END OF REPORT" >> ~/report.txt` once.
If you already added it correctly, you are done. If the errors were overwritten or the marker appears twice, use Reset and append it once.

## Explanation

**`>>`** appends output. It creates a file if necessary, but unlike `>` it does not empty an existing file.

```sh
echo "END OF REPORT" >> ~/report.txt
```

A single `>` here would replace all the evidence with just the marker. Running the append twice adds two markers. Inspect the current file before repeating a step that adds content.

The check reads the finished report. Rebuilding it from the unchanged source also works, provided the errors stay in source order and the marker appears once at the end.
