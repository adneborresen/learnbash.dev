# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
f=$LEARNER_HOME/deploy.sh
if ! { [ -f "$f" ] && cmp -s "$f" /run/learnbash/expected/deploy.sh; }; then
  fail "The helper changed or is missing. Reset restores the supplied script."
fi
[ -f "$LEARNER_HOME/deployed.txt" ] && cmp -s "$LEARNER_HOME/deployed.txt" /run/learnbash/expected/deployed.txt && pass "The local recovery rehearsal result is saved."
fail "Run the supplied helper to create its complete result in ~/deployed.txt."
