# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
# Permit an omitted final newline, but no extra bytes or blank lines.
text_equal() {
  [ -f "$1" ] || return 1
  cmp -s "$1" "$2" || { cat "$1"; printf '\n'; } | cmp -s - "$2"
}

f=$LEARNER_HOME/note.txt
[ -f "$f" ] || fail "No ~/note.txt is saved yet. In nano, press Ctrl+O and Enter."
text_equal "$f" /run/learnbash/expected/note.txt && pass "Your corrected three-line note is saved."
if cmp -s "$f" <(cat /run/learnbash/expected/note.txt; printf '\n'); then
  fail "The text is correct, but there is an extra blank line at the end. In nano, remove that empty line with Backspace, then save again."
fi
fail "Save exactly the three requested lines, with Status: ready. Keep the Team and Next lines unchanged."
