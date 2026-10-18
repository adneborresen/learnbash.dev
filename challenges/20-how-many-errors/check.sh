# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
answer=$(answer_trimmed)
# Normalize decimal integer spelling without evaluating Bash arithmetic.
decimal=${answer#+}
if [[ -n $decimal && $decimal != *[!0-9]* ]]; then
  decimal=${decimal#"${decimal%%[!0]*}"}
  answer=${decimal:-0}
fi
case $answer in
  110) fail "That also counts lines with a lowercase \"error\" (the WARN lines). Count only lines with ERROR in capitals." ;;
  500) fail "That's the number of lines in the whole file. Count only the lines that contain ERROR." ;;
  568) fail "That's a word count. wc -l counts lines." ;;
esac
ANSWER=$answer check_answer "71" "Not quite. Count the lines that contain ERROR: grep finds them, wc -l counts them." "Correct! 71 errors. Time for a coffee and a chat with the database team."
