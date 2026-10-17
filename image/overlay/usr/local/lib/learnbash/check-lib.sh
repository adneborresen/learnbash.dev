# shellcheck shell=bash
# Helpers for challenge checkers. Source with:
#   . /usr/local/lib/learnbash/check-lib.sh
export LEARNER_HOME=/home/learner

pass() { echo "${1:-Correct!}"; exit 0; }
fail() { echo "$1"; exit 1; }

# Current directory of the learner's interactive shell on ttyS0.
learner_cwd() {
  local pid
  pid=$(pgrep -t ttyS0 -x bash -o) || return 1
  readlink "/proc/$pid/cwd"
}
