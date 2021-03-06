#!/bin/bash

## Pre ubuntu 16.04

set -e

# Kontrola uzivatela (je vyzatovany root)
function check {
    RET=0
    if [ "$USER" != "root" ]; then
        echo "Script have to run as root user!" 1>&2
        RET=1
    fi;
    return $RET
}

# Instalacia Python3.6 (default: 3.5)
function installPython {
    add-apt-repository ppa:jonathonf/python-3.6
    apt update
    apt install python3.6 virtualenv unzip -y
}

# Instalacia databazy a nastavenie ako sluzby
function installElasticsearch {
    wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | apt-key add -
    apt install apt-transport-https -y
    echo "deb https://artifacts.elastic.co/packages/6.x/apt stable main" | tee -a /etc/apt/sources.list.d/elastic-6.x.list
    apt update
    apt install openjdk-8-jre elasticsearch kibana
    systemctl enable elasticsearch
    systemctl start elasticsearch
    systemctl enable kibana
    systemctl start kibana
}

# Instalacia virtualneho displeja
function installXvfb {
    apt install xvfb
}

check

installPython

installElasticsearch

installXvfb
