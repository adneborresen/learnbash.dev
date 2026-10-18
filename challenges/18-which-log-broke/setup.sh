# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1

mkdir incident
# The same checkout incident in each exercise: 500 records, 71 ERRORs, 39 WARNs.
# awk writes it much faster than a Bash loop in the emulated machine.
awk 'BEGIN {
  for (i = 1; i <= 500; i++) {
    t = sprintf("2026-10-17 09:%02d:%02d", int(i / 60) % 60, i % 60)
    if (i == 1) print t " INFO checkout incident status: OPEN"
    else if (i == 500) print t " INFO checkout incident status: INVESTIGATING"
    else if (i % 7 == 0) print t " ERROR 503 checkout: database timeout"
    else if (i % 11 == 0) print t " WARN checkout: error rate below alert limit"
    else print t " INFO checkout: request " i " accepted"
  }
}' > incident/web-06.log

for n in 1 2 3 4 5 7 8; do
  for ((i = 1; i <= 40; i++)); do printf '2026-10-17 INFO web-%02d request %d accepted\n' "$n" "$i"; done > "incident/web-0$n.log"
done
printf '2026-10-17 ERROR 500 catalogue bug\n' >> incident/web-03.log
printf '2026-10-17 WARN response took 503 ms\n' >> incident/web-08.log
fix_owner
