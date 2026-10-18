mkdir ~/handover
grep ERROR ~/logs/app.log > ~/handover/errors.txt
echo "END OF REPORT" >> ~/handover/errors.txt
sort ~/access.log | uniq -c | sort -n > ~/handover/visitors.txt
