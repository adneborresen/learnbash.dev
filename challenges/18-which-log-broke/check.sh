# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
answer=$(answer_trimmed)
name=$answer
# Accept real paths from home or incident, not an arbitrary matching basename.
if [[ $answer == */* ]]; then
  case $answer in
    '~/'*) candidates=("$LEARNER_HOME/${answer#\~/}") ;;
    /*) candidates=("$answer") ;;
    *) candidates=("$LEARNER_HOME/$answer" "$LEARNER_HOME/incident/$answer") ;;
  esac
  matched=false
  for candidate in "${candidates[@]}"; do
    resolved=$(realpath -e -- "$candidate" 2>/dev/null) || continue
    if [ "$resolved" = "$LEARNER_HOME/incident/web-06.log" ]; then
      name=web-06.log
      matched=true
      break
    fi
  done
  $matched || fail "That path doesn't identify the matching log in ~/incident. Enter its name or actual path."
fi
case $name in
  web-06.log) pass "Correct! web-06 is the server that failed." ;;
  web-06) fail "Almost: include the ending too, exactly as grep shows it." ;;
  web-03.log) fail "web-03.log has ERROR 500, a different error. We're looking for ERROR 503." ;;
  web-08.log) fail "web-08.log mentions 503 ms (a slow response), not ERROR 503." ;;
esac
check_answer "web-06.log" "Not quite. Search for the exact text ERROR 503 in the logs."
