# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
given=$(answer_trimmed)
if [[ ${given^^} == INVESTIGATING && $given != INVESTIGATING ]]; then
  fail "You found the right status. Type it in capitals, exactly as it appears in the log: INVESTIGATING."
fi
check_answer INVESTIGATING "Read the final status in ~/logs/app.log, not the opening or previous incident." "The current incident is still INVESTIGATING."
