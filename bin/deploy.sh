#!/bin/bash
set -e
touch /home/youpers/maintenance
cd /home/youpers/yp-ewl-webclient
git pull origin $1
export NODE_ENV=$2
npm install
grunt build
sudo /usr/sbin/service nginx  restart
rm /home/youpers/maintenance
