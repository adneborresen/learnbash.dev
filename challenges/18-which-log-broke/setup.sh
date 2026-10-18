# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1

mkdir incident
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
done > incident/web-06.log

for n in 1 2 3 4 5 7 8; do
  for ((i = 1; i <= 40; i++)); do printf '2026-10-17 INFO web-%02d request %d accepted\n' "$n" "$i"; done > "incident/web-0$n.log"
done
printf '2026-10-17 ERROR 500 catalogue bug\n' >> incident/web-03.log
printf '2026-10-17 WARN response took 503 ms\n' >> incident/web-08.log
fix_owner
