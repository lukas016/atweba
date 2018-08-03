#!/bin/bash

# Nastavenie virtualneho prostredia
virtualenv -p python3.6 .
source ./bin/activate

# Instalacia dodatocnych kniznic a rozsireni
pip3.6 install -r stable-req.txt
wget 'https://chromedriver.storage.googleapis.com/2.35/chromedriver_linux64.zip'
unzip chromedriver_linux64.zip
mv chromedriver bin/
rm -f chromedriver_linux64.zip
