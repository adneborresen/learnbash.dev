# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
case $(answer_trimmed) in
  todo-old.txt) fail "That file is inside the projects folder. We want the one directly in your home directory." ;;
  projects | downloads | photos) fail "That one is a folder (shown in blue). Look for the name that is not blue." ;;
  todo-for-new-hire) fail "Almost: include the ending too, exactly as ls shows it." ;;
esac
check_answer "todo-for-new-hire.txt" "Not quite. Run ls in your home directory and copy the name that is not a folder." "Correct! That's your first task file."
