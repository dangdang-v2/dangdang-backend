#!/bin/bash
REPOSITORY=/home/ubuntu/dangdang_BE
sudo pm2 kill
cd $REPOSITORY

sudo rm -rf node_modules
sudo npm cache clean --force && npm i
sudo pm2 kill
sudo pm2 start app.js