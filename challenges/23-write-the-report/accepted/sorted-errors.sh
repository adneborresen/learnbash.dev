# These records are already sorted by timestamp, so sorting preserves their order.
# wrong/reordered-errors.sh covers a command that actually changes the order.
grep ERROR logs/app.log | sort > report.txt
echo "END OF REPORT" >> report.txt
