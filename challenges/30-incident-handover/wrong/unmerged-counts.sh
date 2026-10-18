mkdir ~/handover
grep ERROR ~/logs/app.log > ~/handover/errors.txt
echo "END OF REPORT" >> ~/handover/errors.txt
uniq -c ~/access.log | sort -nr > ~/handover/visitors.txt
