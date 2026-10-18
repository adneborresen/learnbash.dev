# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1

# filler TOPIC COUNT: COUNT numbered lines of handbook-style text.
filler() {
  local i sentences=(
    "follow the agreed process and ask your team lead if something is unclear."
    "write down what you changed and why, so the next person can follow along."
    "keep shared spaces tidy and leave things as you would like to find them."
    "if in doubt, ask in the team channel before acting on your own."
  )
  for ((i = 1; i <= $2; i++)); do
    printf '%s %d.%d: %s\n' "$1" "$3" "$i" "${sentences[i % 4]}"
  done
}

{
  printf 'ACME WEB CO. EMPLOYEE HANDBOOK\n==============================\n\n'
  printf '1. Welcome\n----------\n'
  filler "Rule" 60 1
  printf '\n2. Working hours\n----------------\n'
  filler "Rule" 70 2
  printf '\n3. Wi-Fi (old network)\n----------------------\n'
  printf 'This network was switched off in March. The new Wi-Fi details are in section 7.\n'
  printf 'Network: acme-guest\nPassword: blue-falcon-17\n'
  printf '\n4. Holidays\n-----------\n'
  filler "Rule" 80 4
  printf '\n5. Security\n-----------\n'
  filler "Rule" 90 5
  printf '\n6. Servers\n----------\n'
  filler "Rule" 80 6
  printf '\n7. Wi-Fi\n--------\n'
  printf 'Use this network for all work devices.\n'
  printf 'Network: acme-office\nPassword: maple-otter-42\n'
  printf '\n8. Leaving the company\n----------------------\n'
  filler "Rule" 40 8
} > handbook.txt
fix_owner
