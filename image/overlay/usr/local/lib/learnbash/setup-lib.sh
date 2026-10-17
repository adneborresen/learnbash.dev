# shellcheck shell=bash
# Helpers for challenge setup scripts (setup.sh). Source with:
#   . /usr/local/lib/learnbash/setup-lib.sh
# Setup runs as root with /root as the current directory.
set -eu
umask 022
export LEARNER_HOME=/home/learner

# Gives everything in the learner's home back to the learner. Call this at
# the end of every setup script that creates files there.
fix_owner() { chown -R learner:learner "$LEARNER_HOME"; }
