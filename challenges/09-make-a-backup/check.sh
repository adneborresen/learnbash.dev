# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
b=$LEARNER_HOME/backup
c=$LEARNER_HOME/config
expected=/run/learnbash/expected
[ -e "$b" ] || fail "There is no ~/backup yet. Create it with mkdir first."
[ -d "$b" ] || fail "~/backup is a file, not a directory: cp created it because the directory didn't exist yet. Press Reset, then run mkdir backup before copying."
missing=()
for f in nginx.conf app.conf; do
  [ -f "$c/$f" ] || fail "The original ~/config/$f is gone. A backup is a copy: the originals must stay. Press Reset to get it back."
  if [ -L "$c/$f" ] || ! cmp -s "$expected/$f" "$c/$f"; then
    fail "The original ~/config/$f has changed. Press Reset, then copy the original without editing it."
  fi
  if [ ! -f "$b/$f" ]; then
    missing+=("$f")
  elif [ -L "$b/$f" ] || [ "$c/$f" -ef "$b/$f" ]; then
    fail "~/backup/$f is a link, not an independent backup. Use cp without -l or -s."
  elif ! cmp -s "$expected/$f" "$b/$f"; then
    fail "~/backup/$f is different from the original in ~/config. Copy it again."
  fi
done
case ${#missing[@]} in
  0) pass "Backup done: both config files are safe in ~/backup." ;;
  1) fail "Halfway there: ~/backup is missing ${missing[0]}." ;;
  *) fail "~/backup exists, but nginx.conf and app.conf aren't in it yet." ;;
esac
