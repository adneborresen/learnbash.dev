# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
mkdir -p /run/learnbash/expected
printf 'Checkout investigation in progress\n' > /run/learnbash/expected/status.txt
fix_owner
