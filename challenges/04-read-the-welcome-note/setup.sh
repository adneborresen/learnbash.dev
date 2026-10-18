# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
mkdir -p notes
printf 'Welcome to Acme Web Co.!\n\nYour desk is the one by the window.\nYour locker code is 4721.\nLunch is at noon in the kitchen.\n' > notes/welcome.txt
printf 'Welcome to Acme Web Co.!\n\nYour locker code is 1066.\n(This note is from 2025. Lockers have new codes now.)\n' > notes/welcome-2025.txt
fix_owner
