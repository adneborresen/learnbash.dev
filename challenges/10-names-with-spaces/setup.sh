# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
mkdir reports backup
printf 'Q3 approved report\nRevenue: 310000\n' > 'reports/Q3 report.txt'
printf 'Q3 draft report\nRevenue: unconfirmed\n' > 'reports/Q3 report (old).txt'
mkdir -p /run/learnbash/expected
cp reports/* /run/learnbash/expected/
fix_owner
