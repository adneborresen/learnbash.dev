# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
answer=$(answer_trimmed)
case $answer in
  198.51.100.7) fail "That address made 25 requests in a row, but someone else made more in total. Did you sort before uniq -c?" ;;
  *203.0.113.42*) [ "$answer" = 203.0.113.42 ] || fail "Right address! Type just the IP address, without the count." ;;
esac
check_answer "203.0.113.42" "Not quite. Count how often each address occurs and pick the biggest count." "Correct! 203.0.113.42 made 40 requests. Blocked."
