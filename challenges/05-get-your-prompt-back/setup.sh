# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
printf 'Recovery code: 6318\n' > recovery.txt
fix_owner
