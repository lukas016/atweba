#!/usr/bin/python3.6

from aggregator import Aggregator
import time
from sys import exit
from manager.manager import TestManager
from threading import Thread
import logging


def initLogger():
    FORMAT = '%(asctime)-15s %(name)s %(levelname)s: %(message)s'
    logging.basicConfig(format=FORMAT, level=logging.DEBUG)

def initApiServer():
    from api.server import apiServer
    apiServer.run(port=5900, threaded=True)

def startThreads(threads):
    for thread in threads:
        thread.start()

def joinThreads(threads):
    for thread in threads:
        thread.join()
        threads.remove(thread)

if __name__ == '__main__':
    initLogger()
    threads = [Aggregator(), TestManager(), Thread(target=initApiServer)]
    startThreads(threads)
    joinThreads(threads)
    exit(0)
