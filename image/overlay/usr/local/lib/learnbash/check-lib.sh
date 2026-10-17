# shellcheck shell=bash
# Helpers for challenge checkers (check.sh). Source with:
#   . /usr/local/lib/learnbash/check-lib.sh
# A checker passes by exiting 0. The first line it prints is shown to the
# learner, so make it a friendly, specific message.
export LEARNER_HOME=/home/learner

pass() { echo "${1:-Correct!}"; exit 0; }
fail() { echo "$1"; exit 1; }

# Current directory of the learner's interactive shell on ttyS0.
learner_cwd() {
  local pid
  pid=$(pgrep -t ttyS0 -x bash -o) || return 1
  readlink "/proc/$pid/cwd"
}

# The learner's answer (from the answer box) without surrounding whitespace.
answer_trimmed() {
  local a=${ANSWER-}
  a=${a#"${a%%[![:space:]]*}"}
  a=${a%"${a##*[![:space:]]}"}
  printf '%s' "$a"
}

# check_answer EXPECTED [WRONG_MESSAGE] [RIGHT_MESSAGE]
check_answer() {
  local given
  given=$(answer_trimmed)
  [ -n "$given" ] || fail "Type your answer into the answer box first."
  [ "$given" = "$1" ] && pass "${3:-Correct!}"
  fail "${2:-Not quite. Have another look.}"
}
