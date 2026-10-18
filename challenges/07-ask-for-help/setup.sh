# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
printf 'Incident rota\n\nTeam: website\nShift: morning\n\nContact details\nOwner: Morgan\nBackup: Alex\n' > rota.txt
fix_owner
