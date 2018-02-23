from threading import Thread
import time
from json import dumps, loads
from pprint import pprint
import logging
from zeromq import ZeroServer, ZeroClient
from database.manager import createDataManager, getDatabasesType

class Aggregator(Thread):
    def initZeroServer(self):
        self.server = ZeroServer(self.name)
        self.modules = {}

    def initDataManager(self):
        self.db = createDataManager(getDatabasesType('elasticsearch'), host="192.168.10.40")

    def init(self):
        self.initZeroServer()
        self.initDataManager()
        self.logger = logging.getLogger(self.name)
        self.logger.info('Initialized')

    def selectAction(self, msg):
        try:
            getattr(self, 'action_%s' % msg['type'])(msg)
        except Exception as e:
            pprint(e)
            self.server.sendMsg(['type'], {'status': False, 'error': str(e)})

    def action_registerModule(self, msg):
        module = msg['from']
        self.logger.info('REGISTER MODULE: ' + module)
        self.modules[module] = ZeroClient(self.name, module)
        result = self.modules[module].checkConnection()
        self.server.sendMsg('registerModule', {'status': result})
        self.logger.info('REGISTER MODULE: ' + module + ', Status: ' + str(result))

    def action_createEvent(self, msg):
        msgObject = msg['msg']
        result = self.db.createEvent(msgObject)
        self.server.sendMsg(msg['type'], {'status': result})

    def action_createScenario(self, msg):
        msgObject = msg['msg']
        result = self.db.createScenario(msgObject)
        self.server.sendMsg(msg['type'], {'status': result})

    def action_getScenario(self, msg):
        msgObject = msg['msg']
        result = self.db.getScenario(msgObject)
        self.server.sendMsg(msg['type'], {'status': result})

    def run(self):
        self.init()
        while self.run:
            try:
                msgObject = self.server.recvMsg()
                self.selectAction(msgObject)
            except UserWarning:
                pass
        self.logger.info('Stopped (run: %s)' % self.run)

