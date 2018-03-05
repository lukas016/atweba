#!/bin/bash

ACTUAL_DIR=$PWD

cd ${ACTUAL_DIR}/src/backend
./init.sh

cd ${ACTUAL_DIR}/src/frontend
yarn

cd ${ACTUAL_DIR}/src/client/eventHandler/
yarn
webpack

cd ${ACTUAL_DIR}
