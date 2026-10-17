# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
mkdir -p reports
printf 'Q3 REPORT (FINAL VERSION)\nRevenue grew 12%% this quarter.\n' > reports/report_final_FINAL.txt
printf 'Q3 REPORT (DRAFT, do not send)\nRevenue grew ??%% this quarter.\n' > reports/report_draft.txt
printf 'month,amount\njuly,1200\naugust,1350\nseptember,1410\n' > reports/budget.csv
printf 'temporary data\n' > reports/junk.tmp
fix_owner
