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

if __name__ == '__main__':
    initLogger()
    threads = [Aggregator(name="aggregator"), TestManager(name="testmanager"), Thread(target=initApiServer, name="api")]
    startThreads(threads)
    exit(joinThreads(threads))
