# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
mkdir -p /run/learnbash/expected
printf 'Team: website\nStatus: ready\nNext: review logs\n' > /run/learnbash/expected/note.txt
fix_owner
