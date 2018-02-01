#!/usr/bin/python3.6

from aggregator import Aggregator
import time
from sys import exit
from api.server import apiServer

if __name__ == '__main__':
    aggregator = Aggregator()
    aggregator.start()

    apiServer.run(port=5900, threaded=True)
    time.sleep(120)
    exit(0)
