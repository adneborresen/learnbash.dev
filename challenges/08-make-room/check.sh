# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
d=$LEARNER_HOME/projects/notes
if [ -L "$d" ]; then
  fail "~/projects/notes is a link to another place, not a directory. Press Reset, then create it with mkdir."
elif [ -d "$d" ]; then
  pass "Room made: ~/projects/notes is ready."
elif [ -e "$d" ]; then
  fail "~/projects/notes is a file, not a directory. Press Reset, then create it with mkdir."
fi
[ -d "$LEARNER_HOME/notes" ] && fail "You created ~/notes, in your home directory. It should be inside projects: ~/projects/notes."
found=$(find "$LEARNER_HOME" -name notes -type d -print -quit)
[ -n "$found" ] && fail "Found a notes folder in ~${found#"$LEARNER_HOME"}, but it should be ~/projects/notes."
fail "There's no ~/projects/notes yet."
