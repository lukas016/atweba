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
            self.server.sendMsg(msg['type'], {'status': False, 'error': str(e)})

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

    def action_createApp(self, msg):
        msgObject = msg['msg']
        msgObject['lastTest'] = 0
        result = self.db.createApp(msgObject)
        self.server.sendMsg(msg['type'], {'status': True})

    def action_setRegressTest(self, msg):
        self.server.sendMsg(msg['type'], {'status': self.db.setRegressTest(msg['msg'])})

    def action_setResultId(self, msg):
        self.server.sendMsg(msg['type'], {'status': self.db.setLastResultId(msg['msg'])})

    def action_createResult(self, msg):
        self.server.sendMsg(msg['type'], {'status': self.db.createResult(msg['msg'])})

    def action_deleteApp(self, msg):
        self.server.sendMsg(msg['type'], {'status': self.db.deleteApp(msg['msg'])})

    def action_getApp(self, msg):
        msgObject = msg['msg']
        result = self.db.getApp(msgObject)
        self.server.sendMsg(msg['type'], {'status': True, 'data': result})

    def action_getScenarios(self, msg):
        result = self.db.getScenarios(msg['msg'])
        self.server.sendMsg(msg['type'], {'status': True, 'data': result})

    def action_runTest(self, msg):
        scenario = self.db.getTest(msg)
        msg['msg']['scenario'] = scenario
        result = self.modules['testmanager'].sendCommand(msg['type'], msg['msg'])
        self.server.sendMsg(msg['type'], result)

    def action_updateTest(self, msg):
        self.server.sendMsg(msg['type'], self.db.updateTest(msg['msg']))

    def run(self):
        self.init()
        while self.run:
            try:
                msgObject = self.server.recvMsg()
                self.selectAction(msgObject)
            except UserWarning:
                pass
        self.logger.info('Stopped (run: %s)' % self.run)

