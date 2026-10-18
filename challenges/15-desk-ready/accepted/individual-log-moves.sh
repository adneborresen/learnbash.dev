mkdir ~/handover
mkdir ~/handover/logs
cp ~/desk/"handover template.txt" ~/handover/note.txt
printf 'Project: website\nStatus: ready\nNext: inspect incident logs\n' > ~/handover/note.txt
mv ~/desk/test-1.log ~/handover/logs/
mv ~/desk/test-2.log ~/handover/logs/
mv ~/desk/test-3.log ~/handover/logs/
rm ~/desk/junk.tmp
