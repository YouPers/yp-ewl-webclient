#!/bin/bash
set -e
cd /home/youpers/$2-frontend
git pull origin $1
export NODE_ENV=$2
npm install  # actually npm upadte would be better but takes 10 minutes

grunt deploy
sudo /usr/sbin/service nginx  restart
