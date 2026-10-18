# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
mkdir -p documents/operations/2026/q1 documents/operations/2026/q4 documents/hr/contracts \
  documents/archive/old/operations documents/marketing/campaigns
printf 'server,service\nweb-06,checkout\nweb-03,catalogue\n' > documents/operations/2026/q4/server-inventory_2026.csv
printf 'server,service\nweb-06,unconfirmed\n' > documents/operations/2026/q1/server-inventory_2026_draft.csv
printf 'server,service\nweb-02,checkout\n' > documents/archive/old/operations/server-inventory_2025.csv
printf 'quarter,revenue\nq1,310000\n' > documents/operations/2026/q1/revenue.csv
printf 'name,role\nAda,engineer\n' > documents/hr/contracts/staff.csv
printf 'Spring sale: 20%% off.\n' > documents/marketing/campaigns/spring.txt
printf 'name,phone\nreception,555-0100\n' > contacts.csv
mkdir -p /run/learnbash/expected
cp documents/operations/2026/q4/server-inventory_2026.csv /run/learnbash/expected/
fix_owner
