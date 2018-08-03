##
# @file aggregator.py
# @author Lukas Koszegy
# @brief Centralny komunikacny modul serverovej aplikacie
##

from threading import Thread
import time
from json import dumps, loads
import logging
from zeromq import ZeroServer, ZeroClient
from database.manager import createDataManager, getDatabasesType
from configparser import ConfigParser

class Aggregator(Thread):
    def initZeroServer(self):
        self.server = ZeroServer(self.name)
        self.modules = {}

    # Vytvorenie instancie databazy
    def initDataManager(self):
        config = self.config
        self.db = createDataManager(getDatabasesType(config['databaseType']), host=config['databaseAddr'])

    def __init__(self, name, config):
        Thread.__init__(self, name=name)
        self.config = config['aggregator']
        self.initZeroServer()
        self.initDataManager()
        self.logger = logging.getLogger(self.name)
        self.logger.info('Initialized')

    # Vyber metody na zaklade typu spravy
    def selectAction(self, msg):
        try:
            getattr(self, 'action_%s' % msg['type'])(msg)
        #Ak je generovana vynimka zasli naspat chybovu spravu
        except Exception as e:
            self.server.sendMsg(msg['type'], {'status': False, 'error': str(e)})

    # Registracia ineho modulu obsahujuceho ZeroServer
    def action_registerModule(self, msg):
        module = msg['from']
        self.logger.info('REGISTER MODULE: ' + module)
        self.modules[module] = ZeroClient(self.name, module)
        result = self.modules[module].checkConnection()
        self.server.sendMsg('registerModule', {'status': result})
        self.logger.info('REGISTER MODULE: ' + module + ', Status: ' + str(result))

    def action_createEvent(self, msg):
        self.server.sendMsg(msg['type'], {'status': self.db.createEvent(msg['msg'])})

    def action_createApp(self, msg):
        self.server.sendMsg(msg['type'], {'status': self.db.createApp(msg['msg'])})

    def action_setRegressTest(self, msg):
        self.server.sendMsg(msg['type'], {'status': self.db.setRegressTest(msg['msg'])})

    def action_setRegressTestForTest(self, msg):
        self.server.sendMsg(msg['type'], {'status': self.db.setRegressTestForTest(msg['msg'])})

    def action_setTestId(self, msg):
        self.server.sendMsg(msg['type'], {'status': self.db.setLastTestId(msg['msg'])})

    def action_setTestState(self, msg):
        self.server.sendMsg(msg['type'], {'status': self.db.setTestState(msg['msg'])})

    def action_createTest(self, msg):
        self.server.sendMsg(msg['type'], {'status': self.db.createTest(msg['msg'])})

    def action_deleteApp(self, msg):
        self.server.sendMsg(msg['type'], {'status': self.db.deleteApp(msg['msg'])})

    def action_getApp(self, msg):
        self.server.sendMsg(msg['type'], {'status': True, 'data': self.db.getApp(msg['msg'])})

    def action_getScenarios(self, msg):
        self.server.sendMsg(msg['type'], {'status': True, 'data': self.db.getScenarios(msg['msg'])})

    def action_getResult(self, msg):
        self.server.sendMsg(msg['type'], {'status': True, 'data': self.db.getResult(msg['msg'])})

    def action_getResultAgg(self, msg):
        self.server.sendMsg(msg['type'], {'status': True, 'data': self.db.getResultAgg(msg['msg'])})

    def action_setImgScore(self, msg):
        self.server.sendMsg(msg['type'], {'status': self.db.setImgScore(msg['msg'])})

    def action_setScenarioName(self, msg):
        self.server.sendMsg(msg['type'], {'status': self.db.setScenarioName(msg['msg'])})

    def action_getTestInternal(self, msg):
        manage, scenario = self.db.getTest(msg['msg'])
        self.server.sendMsg(msg['type'], {'status': True, 'data': {'manage': manage, 'scenario': scenario}})

    def action_getTest(self, msg):
        manage, scenario = self.db.getTest(msg['msg'])
        self.server.sendMsg(msg['type'], {'status': True, 'data': scenario})

    def action_runTest(self, msg):
        result = self.modules['testmanager'].sendCommand(msg['type'], msg['msg'])
        self.server.sendMsg(msg['type'], result)

    def action_updateTest(self, msg):
        self.server.sendMsg(msg['type'], self.db.updateTest(msg['msg']))

    # Cakanie na dotazy
    def run(self):
        while self.run:
            try:
                msgObject = self.server.recvMsg()
                self.selectAction(msgObject)
            # Ziadna odpoved v definovanom intervale
            except UserWarning:
                pass
        self.logger.info('Stopped (run: %s)' % self.run)

