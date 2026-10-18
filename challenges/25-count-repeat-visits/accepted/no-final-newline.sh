sort access.log | uniq -c > visit-counts.txt
truncate -s -1 visit-counts.txt
