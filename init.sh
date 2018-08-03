#!/bin/bash

ACTUAL_DIR=$PWD

#Priprava prostredia pre backend
cd ${ACTUAL_DIR}/src/backend
./init.sh

#Priprava prostredia pre webove rozhranie
cd ${ACTUAL_DIR}/src/frontend
yarn
#Nasadenie opravy do externej kniznice
cp ${ACTUAL_DIR}/src/external/react-image-diff/react-image-diff.js node_modules/react-image-diff/dist/

#Priprava klienta
cd ${ACTUAL_DIR}/src/client/eventHandler/
yarn
webpack

cd ${ACTUAL_DIR}
