# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
mkdir -p logs
cd logs || exit 1
for i in $(seq -w 1 300); do
  printf 'hour %s: 120 requests, 0 errors\n' "$i" > "web-$i.log"
done
printf 'Hourly test logs from the summer. Archive them when testing is over.\n' > README.txt
printf '1. archive the logs\n2. write the summary\n' > todo.txt
mkdir -p /run/learnbash/expected
sha256sum -- *.log > /run/learnbash/expected/logs.sha256
cp README.txt todo.txt /run/learnbash/expected/
fix_owner
