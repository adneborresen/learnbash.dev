# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
d=$LEARNER_HOME/logs
a=$d/archive
expected=/run/learnbash/expected
shopt -s nullglob
[ -e "$a" ] || fail "There is no ~/logs/archive directory yet. Create it with mkdir."
[ -d "$a" ] || fail "~/logs/archive is a file, not a directory (mv renamed a log to 'archive'). Press Reset, then run mkdir archive first."
for f in README.txt todo.txt; do
  if [ ! -f "$d/$f" ]; then
    [ -f "$a/$f" ] && fail "$f was moved into archive too. Only the .log files belong there: *.log matches names that end in .log."
    fail "$f is missing from ~/logs. Press Reset to get it back."
  fi
  if [ -L "$d/$f" ] || ! cmp -s "$expected/$f" "$d/$f"; then
    fail "$f was changed. Leave the notes unchanged in ~/logs."
  fi
done
left=("$d"/*.log)
archived=("$a"/*.log)
[ ${#left[@]} -eq 0 ] || fail "${#archived[@]} logs are archived, but ${#left[@]} .log files are still in ~/logs."
# Check original names and bytes; extra files (e.g. mv -v output) are fine.
while read -r _digest name; do
  if [ ! -f "$a/$name" ] || [ -L "$a/$name" ]; then
    fail "~/logs/archive/$name is missing or isn't a regular log file. Move every original log into archive."
  fi
done < "$expected/logs.sha256"
(cd "$a" && sha256sum --check --status "$expected/logs.sha256") || fail "An archived log's contents changed. Press Reset, then move the logs without editing them."
pass "All 300 original logs are archived unchanged, and the notes stayed put."
