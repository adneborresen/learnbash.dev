printf '#!/bin/bash\ntouch "$HOME/deployed.txt"\n' > deploy.sh
chmod u+x deploy.sh
./deploy.sh
