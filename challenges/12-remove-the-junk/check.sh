# shellcheck shell=bash
. /usr/local/lib/learnbash/check-lib.sh
d=$LEARNER_HOME/inbox
expected=/run/learnbash/expected
for f in invoice-march.pdf invoice-february.pdf reminder.txt; do
  [ -f "$d/$f" ] || fail "Oh no: $f is gone, and rm has no trash bin. Press Reset to get the files back, and only delete invoice-march-copy.pdf."
  if [ -L "$d/$f" ] || ! cmp -s "$expected/$f" "$d/$f"; then
    fail "$f was changed. Press Reset to restore it, and only delete the copy."
  fi
done
if [ -e "$d/invoice-march-copy.pdf" ] || [ -L "$d/invoice-march-copy.pdf" ]; then
  fail "invoice-march-copy.pdf is still in ~/inbox. Delete it with rm."
fi
pass "Clean inbox: the copy is gone and the real invoice is safe."
