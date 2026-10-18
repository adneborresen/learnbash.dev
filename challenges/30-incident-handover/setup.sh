# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
mkdir -p logs
# The same checkout incident in each exercise: 500 records, 71 ERRORs, 39 WARNs.
for ((i = 1; i <= 500; i++)); do
  printf -v t '2026-10-17 09:%02d:%02d' $((i / 60 % 60)) $((i % 60))
  if ((i == 1)); then
    printf '%s INFO checkout incident status: OPEN\n' "$t"
  elif ((i == 500)); then
    printf '%s INFO checkout incident status: INVESTIGATING\n' "$t"
  elif ((i % 7 == 0)); then
    printf '%s ERROR 503 checkout: database timeout\n' "$t"
  elif ((i % 11 == 0)); then
    printf '%s WARN checkout: error rate below alert limit\n' "$t"
  else
    printf '%s INFO checkout: request %d accepted\n' "$t" "$i"
  fi
done > logs/app.log

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

cp logs/app.log /run/learnbash/expected/app.log
{ grep ERROR logs/app.log; printf 'END OF REPORT\n'; } > /run/learnbash/expected/report.txt
sort -nr /run/learnbash/expected/counts.txt > /run/learnbash/expected/ranked.txt
fix_owner
