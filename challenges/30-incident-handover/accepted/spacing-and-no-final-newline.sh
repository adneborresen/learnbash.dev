mkdir ~/handover
grep ERROR ~/logs/app.log > ~/handover/errors.txt
echo "END OF REPORT" >> ~/handover/errors.txt
sort ~/access.log | uniq -c | sort -nr > ~/handover/visitors.txt
awk '{printf "%s\t%s  \n", $1, $2}' ~/handover/visitors.txt > ~/visitors.tmp
mv ~/visitors.tmp ~/handover/visitors.txt
truncate -s -1 ~/handover/visitors.txt
truncate -s -1 ~/handover/errors.txt
