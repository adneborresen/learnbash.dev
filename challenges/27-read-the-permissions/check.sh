# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
check_answer deploy-safe.sh "Check owner read/execute and the absence of group/other write permission." "deploy-safe.sh meets all three conditions."
