mkdir ~/handover
mkdir ~/handover/logs
mv ~/desk/"handover template.txt" ~/handover/note.txt
printf 'Project: website\nStatus: ready\nNext: inspect incident logs\n' > ~/handover/note.txt
mv ~/desk/*.log ~/handover/logs/
rm ~/desk/junk.tmp
