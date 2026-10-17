# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
d=$LEARNER_HOME/logs
a=$d/archive
shopt -s nullglob
[ -e "$a" ] || fail "There is no ~/logs/archive directory yet. Create it with mkdir."
[ -d "$a" ] || fail "~/logs/archive is a file, not a directory (mv renamed a log to 'archive'). Press Reset, then run mkdir archive first."
for f in README.txt todo.txt; do
  if [ ! -f "$d/$f" ]; then
    [ -f "$a/$f" ] && fail "$f was moved into archive too. Only the .log files belong there: *.log matches names that end in .log."
    fail "$f is missing from ~/logs. Press Reset to get it back."
  fi
done
left=("$d"/*.log)
archived=("$a"/*.log)
[ ${#left[@]} -eq 0 ] || fail "${#archived[@]} logs are archived, but ${#left[@]} .log files are still in ~/logs."
[ ${#archived[@]} -eq 300 ] || fail "~/logs/archive has ${#archived[@]} of the 300 logs. Some went missing: press Reset and try again."
pass "All 300 logs archived with one command, and the notes stayed put."
