# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
cat > deploy.sh <<'EOF'
#!/bin/bash
echo "Deploying the website..."
echo "website v2 deployed by $(whoami)" > "$HOME/deployed.txt"
echo "Done! The new website is live."
EOF
chmod 644 deploy.sh
mkdir -p /run/learnbash/expected
cp deploy.sh /run/learnbash/expected/
printf 'website v2 deployed by learner\n' > /run/learnbash/expected/deployed.txt
fix_owner
