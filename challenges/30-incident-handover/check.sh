# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
# Permit an omitted final newline, but no extra bytes or blank lines.
text_equal() {
  [ -f "$1" ] || return 1
  cmp -s "$1" "$2" || { cat "$1"; printf '\n'; } | cmp -s - "$2"
}

# Parse only count/address records. Normalize horizontal spacing and decimal
# counts; keep duplicate records so comparison rejects repeated addresses.
normalize_counts() {
  [ -f "$1" ] || return 1
  awk '
    NF != 2 || $1 !~ /^\+?[0-9]+$/ || $1 + 0 < 1 || $1 + 0 > 88 { bad = 1; next }
    { printf "%d %s\n", $1 + 0, $2 }
    END { if (bad) exit 1 }
  ' "$1"
}

source=$LEARNER_HOME/logs/app.log
if ! { [ -f "$source" ] && [ ! -L "$source" ] && cmp -s "$source" /run/learnbash/expected/app.log; }; then
  fail "The source log changed or is missing. Press Reset, then write to the requested destination."
fi

source=$LEARNER_HOME/access.log
if ! { [ -f "$source" ] && [ ! -L "$source" ] && cmp -s "$source" /run/learnbash/expected/access.log; }; then
  fail "The original access.log changed or is missing. Press Reset and save the result to a different file."
fi

text_equal "$LEARNER_HOME/handover/errors.txt" /run/learnbash/expected/report.txt || fail "The handover error report must contain all ERROR records in source order and one final END OF REPORT line."
actual=/run/learnbash/counts.actual
normalize_counts "$LEARNER_HOME/handover/visitors.txt" > "$actual" || fail "Save a whole-number count and address on each visitor-summary line."
cmp -s "$actual" /run/learnbash/expected/ranked.txt || fail "The visitor summary must include each address once, with correct counts ranked largest first."
pass "Incident handed over: complete evidence, ranked visitors, unchanged sources."
