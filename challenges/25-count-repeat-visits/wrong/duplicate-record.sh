sort access.log | uniq -c > visit-counts.txt
head -n 1 visit-counts.txt >> visit-counts.txt
