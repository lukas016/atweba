from threading import Thread
import time
from json import dumps, loads
from pprint import pprint
import logging
from zeromq import ZeroServer, ZeroClient
class Aggregator(Thread):
    def initZeroServer(self):
        self.server = ZeroServer(self.__name)
        self.logger = logging.getLogger(self.__name)
        self.modules = {}


    def init(self):
        self.__name = 'aggregator'
        self.initZeroServer()
        self.logger = logging.getLogger(self.__name)

    def selectAction(self, msg):
        getattr(self, 'action_%s' % msg['type'])(msg)


    def action_registerModule(self, msg):
        module = msg['from']
        self.logger.info('REGISTER MODULE: ' + module)
        self.modules[module] = ZeroClient(self.__name, module)
        result = self.modules[module].checkConnection()
        self.server.sendMsg('registerModule', {'status': result})
        self.logger.info('REGISTER MODULE: ' + module + ', Status: ' + str(result))


    def run(self):
        self.init()
        self.logger.info('Initialized')
        while True:
            msgObject = self.server.recvMsg()
            self.selectAction(msgObject)

