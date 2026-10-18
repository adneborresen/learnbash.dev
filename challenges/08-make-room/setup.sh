# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
mkdir -p projects/website/src
printf '<h1>Welcome</h1>\n' > projects/website/src/index.html
fix_owner
