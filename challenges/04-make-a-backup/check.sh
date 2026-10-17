# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
b=$LEARNER_HOME/backup
c=$LEARNER_HOME/config
[ -e "$b" ] || fail "There is no ~/backup yet. Create it with mkdir first."
[ -d "$b" ] || fail "~/backup is a file, not a directory: cp created it because the directory didn't exist yet. Press Reset, then run mkdir backup before copying."
missing=()
for f in nginx.conf app.conf; do
  [ -f "$c/$f" ] || fail "The original ~/config/$f is gone. A backup is a copy: the originals must stay. Press Reset to get it back."
  if [ ! -f "$b/$f" ]; then
    missing+=("$f")
  elif ! cmp -s "$c/$f" "$b/$f"; then
    fail "~/backup/$f is different from the original in ~/config. Copy it again."
  fi
done
case ${#missing[@]} in
  0) pass "Backup done: both config files are safe in ~/backup." ;;
  1) fail "Halfway there: ~/backup is missing ${missing[0]}." ;;
  *) fail "~/backup exists, but nginx.conf and app.conf aren't in it yet." ;;
esac
