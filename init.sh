#!/bin/bash

ACTUAL_DIR=$PWD

cd ${ACTUAL_DIR}/src/backend
./init.sh

cd ${ACTUAL_DIR}/src/frontend
yarn
cp ${ACTUAL_DIR}/src/external/react-image-diff/react-image-diff.js node_modules/react-image-diff/dist/

cd ${ACTUAL_DIR}/src/client/eventHandler/
yarn
webpack

cd ${ACTUAL_DIR}
