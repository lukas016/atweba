#!/usr/bin/python3.6

from aggregator import Aggregator
import time
from sys import exit
from manager.manager import TestManager
from threading import Thread
import logging
from configparser import ConfigParser

def initLogger():
    FORMAT = '%(asctime)-15s %(name)s %(levelname)s: %(message)s'
    logging.basicConfig(format=FORMAT, level=logging.DEBUG)

def initApiServer(config):
    from api.server import apiServer
    apiServer.run(port=int(config['api']['port']), threaded=True)

def startThreads(threads):
    for thread in threads:
        thread.daemon = True
        thread.start()
        thread.run = True

def stopThreads(threads):
    for thread in threads:
        if thread.isAlive():
            thread.run = False

def restartThread(thread):
    thread.start()
    time.sleep(5)
    return thread.isAlive()

def joinThreads(threads):
    for thread in threads:
        try:
            thread.join()
            threads.remove(thread)
        except KeyboardInterrupt:
            stopThreads(threads)

        except RuntimeError as e:
            if not thread.isAlive():
                print(e)
                if not restartThread(thread):
                    stopThreads(threads)
                    return 1

def loadConfig():
    file = 'config.ini'
    config = ConfigParser()
    config.read(file)
    return config

if __name__ == '__main__':
    initLogger()
    config = loadConfig()
    threads = [
            Aggregator(name="aggregator", config=config),
            TestManager(name="testmanager", config=config),
            Thread(target=initApiServer, name="api", args=[config])]
    startThreads(threads)
    exit(joinThreads(threads))
