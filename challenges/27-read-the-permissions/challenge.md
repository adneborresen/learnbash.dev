---
id: read-the-permissions
title: "Who can do what?"
module: incident
concept: "Reading file permissions"
introduces: ["permissions", "ls -l"]
reuses: ["ls"]
check: answer
answer_label: "Script filename"
expected_answer: "deploy-safe.sh"
---

## Story

Three recovery scripts are in `~/helpers`. Before running anything, check who is allowed to read, change, and execute each file. All three files belong to you, learner.

## Goal

Submit the filename of the one script whose **owner can read and execute it**, while **neither group nor others can write to it**. Read the permissions; do not change them.

## Hint 1

A long file listing shows permissions in three groups: owner, group, and others. Check all three groups, not just whether you see an x somewhere.

## Hint 2

Run `ls -l ~/helpers`. After the first character, the next nine characters come in groups of three: owner, group, others. Within each group, `r` means read, `w` write, `x` execute, and `-` means that permission is absent.

## Hint 3

Look for `r` and `x` in the owner's first group. Then check that neither of the other two groups contains `w`. Submit the filename of that script, without its path.

## Explanation

For the regular files in this exercise, a listing starts like this:

```text
-rwxr--r-- 1 learner learner ... deploy-safe.sh
```

The first character `-` identifies a regular file. The next nine are permissions:

| Group | Applies to | Example |
|---|---|---|
| first three | owner | `rwx`: read, write, execute |
| middle three | group | `r--`: read only |
| last three | others | `r--`: read only |

A shell script needs to be readable by its interpreter as well as executable when launched directly. Allowing others to write a script lets them change what it does.

These letters describe permissions on the file. Access can also depend on its containing directories and other system rules. Here the directories allow access and the files are ordinary scripts.
