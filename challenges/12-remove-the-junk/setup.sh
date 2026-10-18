# shellcheck shell=bash
. /usr/local/lib/learnbash/setup-lib.sh
cd "$LEARNER_HOME" || exit 1
mkdir -p inbox
printf '%%PDF-1.4\nInvoice 2026-03: 1,250.00\n' > inbox/invoice-march.pdf
cp inbox/invoice-march.pdf inbox/invoice-march-copy.pdf
printf '%%PDF-1.4\nInvoice 2026-02: 980.00\n' > inbox/invoice-february.pdf
printf 'Pay the March invoice before the 15th.\n' > inbox/reminder.txt
mkdir -p /run/learnbash/expected
cp inbox/invoice-march.pdf inbox/invoice-february.pdf inbox/reminder.txt /run/learnbash/expected/
fix_owner
