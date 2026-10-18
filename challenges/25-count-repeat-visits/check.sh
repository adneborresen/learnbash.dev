# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
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

source=$LEARNER_HOME/access.log
if ! { [ -f "$source" ] && [ ! -L "$source" ] && cmp -s "$source" /run/learnbash/expected/access.log; }; then
  fail "The original access.log changed or is missing. Press Reset and save the result to a different file."
fi

actual=/run/learnbash/counts.actual
normalize_counts "$LEARNER_HOME/visit-counts.txt" > "$actual" || fail "Save one positive whole-number count and address on every line of ~/visit-counts.txt."
sort "$actual" | cmp -s - /run/learnbash/expected/counts.txt && pass "Every visitor counted once, with all requests included."
fail "The counts are wrong or an address is missing or repeated. Sort the requests before counting neighbouring repeats."
