# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
mkdir -p projects/website downloads photos
printf 'Task 1: get familiar with the server.\nTask 2: tidy up the logs (see below).\n' > todo-for-new-hire.txt
# Decoy: an old file in a sub-folder.
printf 'Old tasks from 2023. Ignore.\n' > projects/todo-old.txt
printf 'IMG_0001\n' > photos/team-lunch.jpg
fix_owner
