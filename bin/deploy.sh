#!/bin/bash
set -e
cd /home/youpers/yp-ewl-webclient
git pull origin $1
export NODE_ENV=$2
npm install  # actually npm upadte would be better but takes 10 minutes

# enable maintenance mode: our nginx config looks for this file
touch /home/youpers/maintenance

grunt build
sudo /usr/sbin/service nginx  restart

# disable maintenance mode again
rm /home/youpers/maintenance
