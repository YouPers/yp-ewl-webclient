#!/bin/bash
set -e
cd /home/youpers/yp-ewl-webclient
git pull origin $1
export NODE_ENV=$2
npm update

# enable maintenance mode: our nginx config looks for this file
touch /home/youpers/maintenance

grunt build
sudo /usr/sbin/service nginx  restart

# disable maintenance mode again
rm /home/youpers/maintenance
