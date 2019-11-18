#!/bin/sh
set -e

#copy repo_configs to PersistentDisk
rm config_repo/production.js
cp -a -r -f config_repo/. config

yarn install || exit $?
npm install --save-dev cross-env@3.1.4

yarn build:client && yarn build:server && yarn build:sw || exit $?


if [ "$VS_ENV" = 'dev' ]; then
  yarn dev
else
  yarn start
fi
