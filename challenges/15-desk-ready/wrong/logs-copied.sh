mkdir ~/handover
mkdir ~/handover/logs
cp ~/desk/"handover template.txt" ~/handover/note.txt
printf 'Project: website\nStatus: ready\nNext: inspect incident logs\n' > ~/handover/note.txt
cp ~/desk/*.log ~/handover/logs/
rm ~/desk/junk.tmp
