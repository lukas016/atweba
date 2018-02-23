from threading import Thread
import time
from pprint import pprint
from zeromq import ZeroClient, ZeroServer
import logging

class TestManager(Thread):
    def initZeroServer(self):
        self.server = ZeroServer(self.name)

    def initZeroClient(self):
        self.aggClient = ZeroClient(name=self.name)

    def init(self):
        self.initZeroServer()
        self.initZeroClient()
        self.logger = logging.getLogger(self.name)
        self.logger.info('Initialized')

    def run(self):
        self.init()
        self.aggClient.registerMsg()
        self.server.checkConnection()
        self.aggClient.checkRegister()
        while self.run:
            try:
                self.server.recvMsg()
            except UserWarning:
                pass
        self.logger.info('Stopped (run: %s)' % self.run)
