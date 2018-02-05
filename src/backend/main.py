#!/usr/bin/python3.6

from aggregator import Aggregator
import time
from sys import exit
from manager.manager import TestManager
import logging

def initLogger():
    FORMAT = '%(asctime)-15s %(name)s %(levelname)s: %(message)s'
    logging.basicConfig(format=FORMAT, level=logging.DEBUG)

if __name__ == '__main__':
    initLogger()

    aggregator = Aggregator()
    aggregator.start()

    manager = TestManager()
    manager.start()

    from api.server import apiServer

    apiServer.run(port=5900, threaded=True)
    exit(0)
