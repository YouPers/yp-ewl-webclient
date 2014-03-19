#!/bin/bash
set -e
cd /home/youpers/yp-ewl-webclient
git pull origin $1
export NODE_ENV=$2
npm install
grunt build
sudo /usr/sbin/service nginx  restart