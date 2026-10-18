# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
case $(answer_trimmed) in
  blue-falcon-17) fail "That's the old network's password, and that section says it was switched off. Keep reading (in less, press n for the next match)." ;;
  acme-office | acme-guest) fail "That's the name of a network. We need its password." ;;
esac
check_answer "maple-otter-42" "Not quite. Look for the Wi-Fi section that is still in use." "Correct! You're online."
