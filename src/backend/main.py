#!/usr/bin/python3.6

from aggregator import Aggregator
import time
from sys import exit
from manager.manager import TestManager

if __name__ == '__main__':
    aggregator = Aggregator()
    aggregator.start()

    manager = TestManager()
    manager.start()

    from api.server import apiServer

    apiServer.run(port=5900, threaded=True)
    exit(0)
