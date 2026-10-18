# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
mkdir -p incident
pages=(/ /products /cart /checkout /about /login)
for n in 1 2 3 4 5 6 7 8; do
  f=incident/web-0$n.log
  for ((m = 0; m < 40; m++)); do
    printf '2026-10-16 23:%02d:%02d GET %s 200\n' "$m" $(((m * 7 + n) % 60)) "${pages[(m + n) % 6]}"
    case $n:$m in
      3:17) printf '2026-10-16 23:17:30 ERROR 500 Internal Server Error (bug in /cart)\n' ;;
      8:25) printf '2026-10-16 23:25:12 WARN slow response from database (503 ms)\n' ;;
    esac
  done > "$f"
done
printf '2026-10-16 23:41:07 ERROR 503 Service Unavailable (upstream timeout)\n' >> incident/web-06.log
fix_owner
