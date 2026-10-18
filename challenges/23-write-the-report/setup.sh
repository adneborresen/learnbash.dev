# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
mkdir -p logs
cat > logs/app.log <<'EOF'
2026-10-16 22:00:01 INFO website started
2026-10-16 22:14:09 INFO 120 visitors in the last hour
2026-10-16 22:31:44 ERROR could not send email to customer 1187
2026-10-16 22:45:02 WARN disk 81% full
2026-10-16 23:02:17 INFO 98 visitors in the last hour
2026-10-16 23:17:30 ERROR payment provider did not answer
2026-10-16 23:18:02 INFO payment provider is back
2026-10-16 23:41:07 ERROR 503 Service Unavailable (upstream timeout)
2026-10-16 23:59:59 INFO daily backup finished
2026-10-17 00:03:12 ERROR certificate for shop.example.com expires in 7 days
2026-10-17 00:10:00 INFO website running normally
EOF
mkdir -p /run/learnbash/expected
grep ERROR logs/app.log | LC_ALL=C sort > /run/learnbash/expected/errors.txt
printf 'END OF REPORT\n' > /run/learnbash/expected/end.txt
printf 'END OF REPORT' > /run/learnbash/expected/end-no-newline.txt
fix_owner
