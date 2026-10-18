mkdir ~/handover
grep ERROR ~/logs/app.log > ~/handover/errors.txt
echo "END OF REPORT" >> ~/handover/errors.txt
sort ~/access.log | uniq -c | sort -nr > ~/handover/visitors.txt
head -n 1 ~/handover/visitors.txt >> ~/handover/visitors.txt
