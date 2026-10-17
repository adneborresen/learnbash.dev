# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
mkdir -p config projects/website
printf 'server {\n    listen 80;\n    server_name example.com;\n    root /var/www/website;\n}\n' > config/nginx.conf
printf 'APP_NAME=website\nAPP_PORT=8080\nLOG_LEVEL=info\n' > config/app.conf
printf '# Notes about the configs. Not needed in the backup.\n' > config/README.txt
fix_owner
