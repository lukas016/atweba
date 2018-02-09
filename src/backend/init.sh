#!/bin/bash

virtualenv -p python3.6 .
source ./bin/activate
pip3.6 install -r stable-req.txt
