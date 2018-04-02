from threading import Thread
from time import sleep
from pprint import pprint
from zeromq import ZeroClient, ZeroServer
import logging
from manager.selenium import seleniumClient
from manager.modules.screenshot import analyzeScreenshot
from manager.state import testState

class TestManager(Thread):
    def initZeroServer(self):
        self.server = ZeroServer(self.name)

    def initZeroClient(self):
        self.aggClient = ZeroClient(name=self.name)

    def initZeroClient(self):
        self.aggClient = ZeroClient(name=self.name)

    def init(self):
        self.initZeroServer()
        self.initZeroClient()
        self.scenarios = {}
        self.testQueue = []
        self.logger = logging.getLogger(self.name)
        self.logger.info('Initialized')

    def existThread(self, scenarioId):
        return scenarioId in self.scenarios and self.scenarios[scenarioId]['thread'].isAlive()

    def selectAction(self, msg):
        try:
            getattr(self, 'action_%s' % msg['type'])(msg)
        except Exception as e:
            self.server.sendMsg(msg['type'], {'status': False, 'error': str(e)})

    def action_runTest(self, msg):
        scenarioId = msg['msg']['scenario'][0]['scenarioId']
        if self.existThread(scenarioId):
            self.testQueue.append(msg['msg'])
            self.server.sendMsg(msg['type'], {'status': True, 'data': 'waiting'})
        else:
            self.server.sendMsg(msg['type'], {'status': True, 'data': 'running'})
            self.createTest(scenarioId, msg['msg'])

    def createTest(self, scenarioId, msg):
        if not scenarioId in self.scenarios:
            self.scenarios[scenarioId] = {}

        self.scenarios[scenarioId]['thread'] = Test()
        self.scenarios[scenarioId]['thread'].init(msg)
        self.scenarios[scenarioId]['thread'].start()

    def checkQueue(self):
        newQueue = []
        for item in self.testQueue:
            scenarioId = msg['scenario'][0]['scenarioId']
            if self.existThread(scenarioId):
                newQueue.append(item)
            else:
                self.createTest(scenarioId, item)

        self.testQueue = newQueue


    def run(self):
        self.init()
        self.aggClient.registerMsg()
        self.server.checkConnection()
        self.aggClient.checkRegister()
        while self.run:
            try:
                msg = self.server.recvMsg()
                self.selectAction(msg)
                if self.testQueue:
                    self.checkQueue()
            except UserWarning:
                pass
        self.logger.info('Stopped (run: %s)' % self.run)

class Test(Thread):
    def initZeroClient(self):
        self.aggClient = ZeroClient(name=self.name)

    def init(self, msg):
        self.baseImgDir = './screenshot'
        self.appId = msg['appId']
        self.scenarioId = msg['scenario'][0]['scenarioId']
        self.msg = msg
        print(testState.TESTING)
        self.initZeroClient()
        self.logger = logging.getLogger('{}-{}'.format(self.name, self.scenarioId))
        self.logger.info('Initialized')

    def setState(self, state):
        self.aggClient.sendCommand('setTestState',
                {'appId': self.appId, 'scenarioId': self.scenarioId, 'state': state.value})

    def run(self):
        self.setState(testState.TESTING)
        try:
            test = seleniumClient(self.aggClient, self.msg, self.baseImgDir)
            currentId, regressId = test.run()
            self.setState(testState.ANALYZE)
            sleep(5)
            analyze = analyzeScreenshot(self.aggClient, self.appId, self.scenarioId, regressId, currentId)
            self.setState(analyze.analyze())
        except RuntimeError as e:
            self.setState(e.value)
