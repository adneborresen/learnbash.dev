# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
target=$LEARNER_HOME/projects/website/src
# The same as in find-your-desk: a nested interactive Bash owns the foreground
# process group while its parent waits.
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
shown=$cwd
if [[ $cwd == "$LEARNER_HOME" || $cwd == "$LEARNER_HOME"/* ]]; then
  shown="~${cwd#"$LEARNER_HOME"}"
fi
case $cwd in
  "$target") pass "Back on track: you're in ~/projects/website/src." ;;
  "$LEARNER_HOME/projects/blog/assets") fail "That's the first, wrong folder. Now go up two levels with cd ../.. and into website/src." ;;
  "$LEARNER_HOME/projects/blog/src") fail "That's the blog's src folder. You went up one level, but website is two levels up: cd ../.. first." ;;
  "$LEARNER_HOME/projects/website") fail "Close! The source folder is one level deeper: cd src." ;;
  "$LEARNER_HOME") fail "You're home. From here, cd projects/website/src gets you there." ;;
  *) fail "You're in $shown. Your target is ~/projects/website/src." ;;
esac
