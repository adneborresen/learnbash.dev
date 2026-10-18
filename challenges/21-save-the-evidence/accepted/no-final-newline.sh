grep ERROR logs/app.log > errors.txt
truncate -s -1 errors.txt
