sort access.log | uniq -c | sort -nr | awk '{printf "%s\t%s  \n", $1, $2}' > visit-counts.txt
