awk '{n[$0]++} END {for (ip in n) print n[ip], ip}' access.log | sort -rn | head -n 1
