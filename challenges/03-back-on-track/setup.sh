# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
mkdir -p projects/website/assets projects/website/src projects/blog/assets projects/blog/src
printf '<h1>Welcome</h1>\n' > projects/website/src/index.html
printf 'logo\n' > projects/website/assets/logo.png
printf '<h1>Our blog</h1>\n' > projects/blog/src/index.html
printf 'banner\n' > projects/blog/assets/banner.png
fix_owner
