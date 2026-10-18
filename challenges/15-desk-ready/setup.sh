# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
mkdir desk
printf 'Project: website\nStatus: draft\nNext: inspect incident logs\n' > 'desk/handover template.txt'
printf 'Unfinished investigation: keep this draft.\n' > desk/protected-draft.txt
printf 'Temporary scratch data\n' > desk/junk.tmp
for n in 1 2 3; do printf 'Website test %s complete\n' "$n" > "desk/test-$n.log"; done
mkdir -p /run/learnbash/expected
cp desk/* /run/learnbash/expected/
printf 'Project: website\nStatus: ready\nNext: inspect incident logs\n' > /run/learnbash/expected/note.txt
fix_owner
