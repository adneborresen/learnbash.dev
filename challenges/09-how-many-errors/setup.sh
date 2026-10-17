# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
mkdir -p logs
# 500 lines: every 7th is an ERROR (71 in total); every 11th that isn't an
# ERROR is a WARN mentioning "error" in lowercase (39 lines).
for ((i = 1; i <= 500; i++)); do
  printf -v t '2026-10-17 09:%02d:%02d' $((i / 60 % 60)) $((i % 60))
  if ((i % 7 == 0)); then
    printf '%s ERROR payment-service: timeout talking to database\n' "$t"
  elif ((i % 11 == 0)); then
    printf '%s WARN payment-service: error rate 0.%d%% (below limit)\n' "$t" $((i % 9))
  else
    printf '%s INFO payment-service: payment %d accepted\n' "$t" $((1000 + i))
  fi
done > logs/app.log
fix_owner
