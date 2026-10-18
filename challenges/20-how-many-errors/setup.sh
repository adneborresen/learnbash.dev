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

fix_owner
