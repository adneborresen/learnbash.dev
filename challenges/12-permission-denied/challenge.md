---
id: permission-denied
title: Permission denied
module: first-day
concept: File permissions and running scripts
introduces: [permissions, "ls -l", chmod, "./"]
reuses: [ls]
check: state
---

## Story

Last task of the day: deploy the new website. A colleague left you a script:

> Just run `./deploy.sh` in your home directory and you're done!

You try it:

```
$ ./deploy.sh
-bash: ./deploy.sh: Permission denied
```

The script isn't allowed to run yet. Fix that, but safely: on a shared server,
nobody else should be able to change your script.

## Goal

Make `~/deploy.sh` executable for yourself **without** giving anyone else permission
to change (write to) it. Then run it with `./deploy.sh`. It creates `~/deployed.txt`.

## Hint 1

`ls -l` shows each file's permissions as a string like `-rw-r--r--`. An `x` would
mean "executable", and there isn't one yet.

## Hint 2

`chmod` (*change mode*) changes permissions. `u+x` means: for the **u**ser who owns
the file, add e**x**ecute permission.

## Hint 3

Run `chmod u+x deploy.sh`, check with `ls -l deploy.sh` (you should see
`-rwxr--r--`), then run `./deploy.sh`.

## Explanation

`ls -l` shows permissions at the start of each line:

```
-rwxr--r-- 1 learner learner 145 Oct 17 09:00 deploy.sh
```

The first character is the type (`-` file, `d` directory). The next nine are three
groups of three:

| Characters | Who | Meaning here |
|---|---|---|
| `rwx` | **u**ser (the owner, `learner`) | can read, write and execute |
| `r--` | **g**roup (members of group `learner`) | can only read |
| `r--` | **o**thers (everyone else) | can only read |

`r` = read, `w` = write (change), `x` = execute (run as a program; for a directory:
enter it). A `-` means that permission is missing.

**`chmod`** changes them. The *symbolic* form says who (`u`, `g`, `o`, or `a` for all),
`+` or `-`, and which permission:

- `chmod u+x deploy.sh`: add execute for the owner
- `chmod go-w notes.txt`: take write away from group and others

The *numeric* form gives each group a number: `r` = 4, `w` = 2, `x` = 1, added up.
So `7` = `rwx`, `5` = `r-x`, `4` = `r--`:

- `chmod 755 deploy.sh` → `rwxr-xr-x` (a common choice for scripts)
- `chmod 644 notes.txt` → `rw-r--r--` (a common choice for normal files)

**Avoid `chmod 777`.** It gives *everyone* on the system write access. Anyone could
change your script, and the next time you run it, you'd run their code. When something
says "Permission denied", give exactly the permission that's missing.

**Why `./`?** When you type a command name, Bash only looks in the directories
listed in the `PATH` variable, not in the current directory. That way a file
called `ls` lying in some folder can't take over the real `ls`. `./deploy.sh`
says: "the file `deploy.sh` right here".

The first line of the script, `#!/bin/bash`, is called the *shebang*. It tells
the system which program should run the file. (`bash deploy.sh` also works without
the `x` permission, because then `bash` is the program and just reads the file.)
