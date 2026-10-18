# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
# 40 total visits wins; another address has the longest single run (25).
for ((i = 0; i < 25; i++)); do echo 198.51.100.7; done > access.log
for ((i = 1; i <= 40; i++)); do
  echo 203.0.113.42
  if ((i <= 12)); then echo 192.0.2.10
  elif ((i <= 21)); then echo 198.51.100.23
  elif ((i <= 23)); then echo 203.0.113.5
  fi
done >> access.log

mkdir -p /run/learnbash/expected
cp access.log /run/learnbash/expected/access.log
sort access.log > /run/learnbash/expected/sorted.txt
sort access.log | uniq -c | awk '{print $1, $2}' | sort > /run/learnbash/expected/counts.txt
fix_owner
