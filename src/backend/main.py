#!/usr/bin/python3.6

##
# @file main.py
# @author Lukas Koszegy
# @brief Nacitanie konfiguracie a spustanie hlavnych modulov
##

from aggregator import Aggregator
import time
from sys import exit
from manager.manager import TestManager
from threading import Thread
import logging.config
from configparser import ConfigParser

def initLogger(file):
    FORMAT = '%(asctime)-15s %(name)s %(levelname)s: %(message)s'
    logging.config.fileConfig(file)

def initApiServer(config):
    from api.server import apiServer
    apiServer.run(host=config['host'], port=int(config['port']), threaded=True)

## Spustenie vlakien pomocou cyklu
def startThreads(threads):
    for thread in threads:
        thread.daemon = True
        thread.start()
        thread.run = True

## Kontrola vlakien
def stopThreads(threads):
    for thread in threads:
        if thread.isAlive():
            thread.run = False

def restartThread(thread):
    thread.start()
    time.sleep(5)
    return thread.isAlive()

## Cakanie na ukoncenie vlakien
def joinThreads(threads):
    for thread in threads:
        try:
            thread.join()
            threads.remove(thread)
        except KeyboardInterrupt:
            stopThreads(threads)

        except RuntimeError as e:
            if not thread.isAlive():
                if not restartThread(thread):
                    stopThreads(threads)
                    return 1

def loadConfig(file):
    config = ConfigParser()
    config.read(file)
    return config

if __name__ == '__main__':
    configFile = 'config.ini'
    initLogger(configFile)
    config = loadConfig(configFile)
    #List vlakien, ktore sa maju spustit
    threads = [
            Aggregator(name="aggregator", config=config),
            TestManager(name="testmanager", config=config),
            Thread(target=initApiServer, name="api", args=[config['api']])]
    startThreads(threads)
    exit(joinThreads(threads))
