# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
case $(answer_trimmed) in
  1066) fail "That's the code from last year's note, welcome-2025.txt. Read welcome.txt." ;;
  welcome.txt | notes/welcome.txt | '~/notes/welcome.txt') fail "That's the name of the file. The code is written inside it: show it with cat." ;;
  *4721*) [ "$(answer_trimmed)" = 4721 ] || fail "The code is in there. Type just the digits." ;;
esac
check_answer "4721" "Not quite. Read welcome.txt and look for the line about your locker." "Correct! Your locker is open."
