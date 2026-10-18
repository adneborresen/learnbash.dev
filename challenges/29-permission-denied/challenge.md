---
id: permission-denied
title: Permission denied
module: incident
concept: Adding a missing permission
introduces: [chmod]
reuses: [permissions, "ls -l", "./", cat]
check: state
---

## Story

The same local recovery helper is ready, but this fresh copy is missing its owner execute permission. Running `./deploy.sh` reports `Permission denied`.
You have already read permission strings and run an executable helper. Now fix the missing permission without making the script writable by other people.

## Goal

Make `~/deploy.sh` readable and executable by its owner, without giving group or others write permission. Keep its contents unchanged and produce its complete rehearsal result in `~/deployed.txt`.

## Hint 1

Inspect the helper's permissions using the long listing you practised. The owner's execute position is missing.

## Hint 2

`chmod` changes permissions. `u+x` means add execute permission (`x`) for the file's owner (`u`). It leaves the other permission bits as they are.

## Hint 3

From your home directory, run `chmod u+x deploy.sh`, inspect it with `ls -l deploy.sh`, then run `./deploy.sh`. If you already added execute permission, repeating that permission change is harmless.

## Explanation

**chmod** changes a file's mode, which includes its permission bits. The symbolic form combines who, an operation, and a permission:

```sh
chmod u+x deploy.sh
```

Here `u` means the owner, `+` adds permission, and `x` means execute. It changes this exercise's `-rw-r--r--` into `-rwxr--r--` without making the script writable by group or others.

The script must remain readable as well: Bash needs to read its instructions. Running `bash deploy.sh` can work without execute permission, but it does not fix the missing permission requested in this task.

Avoid granting every permission to everyone just to dismiss an error. For example, `chmod 777` would make the script writable by group and others, allowing them to change what you later execute.

This is a local rehearsal. The helper saves its result in the practice machine and does not contact a real server.
