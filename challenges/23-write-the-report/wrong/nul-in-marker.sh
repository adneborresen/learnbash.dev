grep ERROR logs/app.log > report.txt
printf "END OF REPORT\0\n" >> report.txt
