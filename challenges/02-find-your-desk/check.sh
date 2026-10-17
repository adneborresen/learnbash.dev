# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
target=$LEARNER_HOME/projects/website/assets
cwd=$(learner_cwd) || fail "Couldn't find your shell. Try pressing Reset."
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
