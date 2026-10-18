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

printf '9 198.51.100.23\n2 203.0.113.5\n40 203.0.113.42\n12 192.0.2.10\n25 198.51.100.7\n' > visit-counts.txt
fix_owner
