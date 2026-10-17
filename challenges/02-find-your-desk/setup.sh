# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
mkdir -p projects/website/assets projects/website/src projects/blog/assets downloads
printf '<h1>Welcome</h1>\n' > projects/website/src/index.html
printf 'logo\n' > projects/website/assets/logo.png
printf 'banner\n' > projects/blog/assets/banner.png
printf 'Your project lives in projects/website. Images are in its assets folder.\n' > todo-for-new-hire.txt
fix_owner
