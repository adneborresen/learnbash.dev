grep ERROR logs/app.log > report.txt
grep ERROR logs/app.log | head -n 1 >> report.txt
echo "END OF REPORT" >> report.txt
