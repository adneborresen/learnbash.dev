# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
# Permit an omitted final newline, but no extra bytes or blank lines.
text_equal() {
  [ -f "$1" ] || return 1
  cmp -s "$1" "$2" || { cat "$1"; printf '\n'; } | cmp -s - "$2"
}

e=/run/learnbash/expected
d=$LEARNER_HOME/desk
h=$LEARNER_HOME/handover
for name in 'handover template.txt' protected-draft.txt; do
  if ! { [ -f "$d/$name" ] && [ ! -L "$d/$name" ] && cmp -s "$d/$name" "$e/$name"; }; then
    fail "The original template or protected draft is missing or changed. Reset to restore it."
  fi
done
[ -f "$h/note.txt" ] || fail "The handover note is missing from ~/handover/note.txt."
if ! { [ ! -L "$h/note.txt" ] && [ ! "$d/handover template.txt" -ef "$h/note.txt" ]; }; then
  fail "The handover note must be an independent copy."
fi
text_equal "$h/note.txt" "$e/note.txt" || fail "The handover note needs Status: ready, with the other two lines unchanged."
for n in 1 2 3; do
  f=test-$n.log
  if ! { [ ! -e "$d/$f" ] && [ ! -L "$d/$f" ]; }; then
    fail "Some logs are still on the desk. They need to move."
  fi
  if ! { [ -f "$h/logs/$f" ] && cmp -s "$h/logs/$f" "$e/$f"; }; then
    fail "A handover log is missing or its contents changed."
  fi
done
if ! { [ ! -e "$d/junk.tmp" ] && [ ! -L "$d/junk.tmp" ]; }; then
  fail "The desk still contains junk.tmp."
fi
pass "Handover ready: corrected note, complete logs, protected originals."
