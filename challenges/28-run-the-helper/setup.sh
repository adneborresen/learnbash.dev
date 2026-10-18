# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
cat > deploy.sh <<'EOF'
#!/bin/bash
printf 'Rehearsing website recovery locally...\n'
printf 'website recovery rehearsal completed by %s\n' "$(whoami)" > "$HOME/deployed.txt"
printf 'Local rehearsal complete.\n'
EOF
mkdir -p /run/learnbash/expected
cp deploy.sh /run/learnbash/expected/deploy.sh
printf 'website recovery rehearsal completed by learner\n' > /run/learnbash/expected/deployed.txt

chmod 744 deploy.sh
fix_owner
