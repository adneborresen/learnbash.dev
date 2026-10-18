# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
f=$LEARNER_HOME/deploy.sh
[ -f "$f" ] || fail "deploy.sh is missing. Press Reset to get it back."
cmp -s /run/learnbash/expected/deploy.sh "$f" || fail "The deployment script changed. Press Reset, then fix its permissions without changing its contents."
# chmod and execution follow symlinks, so inspect the target's permissions too.
mode=$(stat -Lc %a "$f") || fail "Couldn't read deploy.sh's permissions."
perms=$(stat -Lc %A "$f")
if (((8#$mode & 8#022) != 0)); then
  fail "deploy.sh is now $perms: other people can change it, and you'd run whatever they put in it. Give only yourself execute permission: chmod u+x (or chmod 755)."
fi
if (((8#$mode & 8#100) == 0)); then
  [ -f "$LEARNER_HOME/deployed.txt" ] && fail "The script ran, but deploy.sh still isn't executable ($perms). bash deploy.sh works without it; the goal is to fix the permission so ./deploy.sh works."
  fail "deploy.sh still isn't executable for you ($perms). Add execute permission with chmod."
fi
[ -f "$LEARNER_HOME/deployed.txt" ] || fail "deploy.sh is executable now ($perms). Now run it: ./deploy.sh"
if (((8#$mode & 8#400) == 0)); then
  fail "Bash must be able to read deploy.sh as well as execute it. Restore owner read permission with chmod u+r."
fi
cmp -s /run/learnbash/expected/deployed.txt "$LEARNER_HOME/deployed.txt" || fail "deployed.txt doesn't contain the deployment result. Run the original script with ./deploy.sh."
pass "Deployed! deploy.sh is $perms: you can run it, and nobody else can change it."
