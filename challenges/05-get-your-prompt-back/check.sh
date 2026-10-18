# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
foreground_shell_cwd() {
  local pid pgid tpgid comm
  while read -r pid pgid tpgid comm; do
    if [[ $comm == bash && $pid == "$pgid" && $pgid == "$tpgid" ]]; then
      readlink "/proc/$pid/cwd"
      return
    fi
  done <<< "$(ps -t ttyS0 -o pid=,pgid=,tpgid=,comm=)"
  return 1
}
foreground_shell_cwd >/dev/null || fail "Your terminal is still running a command. Press Ctrl+C to get your prompt back, then check again."
check_answer 6318 "Read the recovery code from ~/recovery.txt after getting your prompt back." "Prompt recovered and code found."
