# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
mkdir -p documents/finance/2024/q1 documents/finance/2024/q4 documents/hr/contracts \
  documents/archive/old/finance documents/marketing/campaigns
printf 'item,amount\nservers,48000\nsalaries,610000\n' > documents/finance/2024/q4/budget_2024.csv
printf 'item,amount\nservers,???\n' > documents/finance/2024/q1/budget_2024_draft.csv
printf 'item,amount\nservers,41000\nsalaries,570000\n' > documents/archive/old/finance/budget_2023.csv
printf 'quarter,revenue\nq1,310000\n' > documents/finance/2024/q1/revenue.csv
printf 'name,role\nAda,engineer\n' > documents/hr/contracts/staff.csv
printf 'Spring sale: 20%% off.\n' > documents/marketing/campaigns/spring.txt
printf 'name,phone\nreception,555-0100\n' > contacts.csv
mkdir -p /run/learnbash/expected
cp documents/finance/2024/q4/budget_2024.csv /run/learnbash/expected/
fix_owner
