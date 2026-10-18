# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
answer=$(answer_trimmed)
# Accept a path copied from find, without discarding arbitrary directory names.
if [[ $answer == */* ]]; then
  case $answer in
    '~/'*) candidate=$LEARNER_HOME/${answer#\~/} ;;
    /*) candidate=$answer ;;
    *) candidate=$LEARNER_HOME/$answer ;;
  esac
  resolved=$(realpath -e -- "$candidate" 2>/dev/null) || resolved=
  [ "$resolved" = "$LEARNER_HOME/todo-for-new-hire.txt" ] && answer=todo-for-new-hire.txt
fi
case $answer in
  todo-old.txt) fail "That file is inside the projects folder. We want the one directly in your home directory." ;;
  projects | downloads | photos) fail "That one is a folder (shown in blue). Look for the name that is not blue." ;;
  todo-for-new-hire) fail "Almost: include the ending too, exactly as ls shows it." ;;
esac
ANSWER=$answer check_answer "todo-for-new-hire.txt" "Not quite. Run ls in your home directory and copy the name that is not a folder." "Correct! That's your first task file."
