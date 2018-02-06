from threading import Thread
import time
from pprint import pprint
from zeromq import ZeroClient, ZeroServer

class TestManager(Thread):
    def initZeroServer(self):
        self.server = ZeroServer(self.__name)

    def initZeroClient(self):
        self.aggClient = ZeroClient(name=self.__name)

    def init(self):
        self.__name = 'manager'
        self.initZeroServer()
        self.initZeroClient()

    def run(self):
        self.init()
        self.aggClient.registerMsg()
        self.server.checkConnection()
        self.aggClient.checkRegister()
        while True:
            self.server.recvMsg()
