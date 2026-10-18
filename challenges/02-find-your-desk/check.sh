# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
target=$LEARNER_HOME/projects/website/assets
# A nested interactive Bash owns the foreground process group while its parent
# waits. Neither the oldest shell nor a background shell is the active prompt.
foreground_shell_cwd() {
  local pid pgid tpgid comm
  while read -r pid pgid tpgid comm; do
    if [[ $comm == bash && $pid == "$pgid" && $pgid == "$tpgid" ]]; then
      readlink "/proc/$pid/cwd"
      return
    fi
  done <<< "$(ps -t ttyS0 -o pid=,pgid=,tpgid=,comm=)"
  return 1
}
cwd=$(foreground_shell_cwd) || fail "Couldn't find an active Bash prompt. Finish the running command, then press Check again."
# Show paths inside the home directory the way the prompt does (with ~).
shown=$cwd
if [[ $cwd == "$LEARNER_HOME" || $cwd == "$LEARNER_HOME"/* ]]; then
  shown="~${cwd#"$LEARNER_HOME"}"
fi
case $cwd in
  "$target") pass "You're at your desk: ~/projects/website/assets." ;;
  "$LEARNER_HOME/projects/blog/assets") fail "That's the blog's assets folder. You need the website's." ;;
  "$LEARNER_HOME/projects/website") fail "Close! The images are one level deeper, in the assets folder." ;;
  "$target"/*) fail "You went one level too deep. Use cd .. to go up." ;;
  *) fail "You're in $shown. Your target is ~/projects/website/assets." ;;
esac
