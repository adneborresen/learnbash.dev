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
fix_owner
