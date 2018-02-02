#!/usr/bin/python3.6

from aggregator import Aggregator
import time
from sys import exit
from api.server import apiServer

if __name__ == '__main__':
    aggregator = Aggregator()
    aggregator.setPort(5901)
    aggregator.start()


    apiServer.run(port=5900, threaded=True)
    exit(0)
