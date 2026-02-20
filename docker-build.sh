#!/bin/bash

# 1. Run docker build
docker run --rm \
 --env-file <(env | grep -iE 'DEBUG|NODE_|ELECTRON_') \
 -v ${PWD}:/project \
 -v ~/.cache/electron:/root/.cache/electron \
 -v ~/.cache/electron-builder:/root/.cache/electron-builder \
 electronuserland/builder:wine \
 /bin/bash -c "npm install && npm run build -- --win --linux"
