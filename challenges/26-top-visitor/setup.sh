# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
# 203.0.113.42 appears 40 times, never twice in a row. 198.51.100.7 appears
# 25 times in one block, so `uniq -c` without `sort` makes it look like the
# top visitor. Eight other addresses appear 20 times each.
others=(198.51.100.23 192.0.2.10 203.0.113.5 198.51.100.61 192.0.2.77 203.0.113.99 198.51.100.140 192.0.2.200)
n=0
for ((i = 1; i <= 200; i++)); do
  if ((i == 101)); then
    for ((j = 0; j < 25; j++)); do echo 198.51.100.7; done
  fi
  if ((i % 5 == 0)); then
    echo 203.0.113.42
  else
    echo "${others[n % 8]}"
    n=$((n + 1))
  fi
done > access.log
fix_owner
