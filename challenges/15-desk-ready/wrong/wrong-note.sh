mkdir ~/handover
mkdir ~/handover/logs
cp ~/desk/"handover template.txt" ~/handover/note.txt
printf 'Project: website\nStatus: draft\nNext: inspect incident logs\n' > ~/handover/note.txt
mv ~/desk/*.log ~/handover/logs/
rm ~/desk/junk.tmp
