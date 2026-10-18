# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
mkdir helpers
for f in deploy-safe.sh deploy-locked.sh deploy-shared.sh; do printf '#!/bin/bash\nprintf "Recovery rehearsal\\n"\n' > "helpers/$f"; done
chmod 744 helpers/deploy-safe.sh
chmod 644 helpers/deploy-locked.sh
chmod 766 helpers/deploy-shared.sh
fix_owner
