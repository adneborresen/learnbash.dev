# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
f=$LEARNER_HOME/deploy.sh
[ -f "$f" ] || fail "deploy.sh is missing. Press Reset to get it back."
mode=$(stat -c %a "$f")
perms=$(stat -c %A "$f")
if (((8#$mode & 8#022) != 0)); then
  fail "deploy.sh is now $perms: other people can change it, and you'd run whatever they put in it. Give only yourself execute permission: chmod u+x (or chmod 755)."
fi
if (((8#$mode & 8#100) == 0)); then
  [ -f "$LEARNER_HOME/deployed.txt" ] && fail "The script ran, but deploy.sh still isn't executable ($perms). bash deploy.sh works without it; the goal is to fix the permission so ./deploy.sh works."
  fail "deploy.sh still isn't executable for you ($perms). Add execute permission with chmod."
fi
[ -f "$LEARNER_HOME/deployed.txt" ] || fail "deploy.sh is executable now ($perms). Now run it: ./deploy.sh"
pass "Deployed! deploy.sh is $perms: you can run it, and nobody else can change it."
