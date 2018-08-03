##
# @file manager.py
# @author Lukas Koszegy
# @brief Sprava testov
##

from threading import Thread
from time import sleep
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

    def __init__(self, name, config):
        Thread.__init__(self, name=name)
        self.initZeroServer()
        self.initZeroClient()
        self.scenarios = {}
        self.testQueue = []
        self.logger = logging.getLogger(self.name)
        self.logger.info('Initialized')

    # Kontrola ci bezi pre dany scenar nejaky test
    def existThread(self, scenarioId):
        return scenarioId in self.scenarios and self.scenarios[scenarioId]['thread'].isAlive()

    # Vyber akcie pre spravy prijate zo ZeroServera
    def selectAction(self, msg):
        try:
            getattr(self, 'action_%s' % msg['type'])(msg)
        except Exception as e:
            self.server.sendMsg(msg['type'], {'status': False, 'error': str(e)})

    # Spustenie testu
    def action_runTest(self, msg):
        scenarioId = msg['msg']['scenarioId']
        # Zaradedenie testu do fronty ak bezi pre dany scenar test
        if self.existThread(scenarioId):
            self.testQueue.append(msg['msg'])
            self.server.sendMsg(msg['type'], {'status': True, 'data': 'waiting'})
        else:
            self.server.sendMsg(msg['type'], {'status': True, 'data': 'running'})
            self.createTest(scenarioId, msg['msg'])

    # Vytvorenie testovacieho vlakna
    def createTest(self, scenarioId, msg):
        if not scenarioId in self.scenarios:
            self.scenarios[scenarioId] = {}

        self.scenarios[scenarioId]['thread'] = Test(msg)
        self.scenarios[scenarioId]['thread'].start()

    # Kontrola ci caka nejaky test vo fronte
    def checkQueue(self):
        newQueue = []
        for item in self.testQueue:
            scenarioId = item['scenarioId']
            if self.existThread(scenarioId):
                newQueue.append(item)
            else:
                self.createTest(scenarioId, item)

        self.testQueue = newQueue

    # Hlavny cyklus
    def run(self):
        # Oznamenie agregatoru ze modul obsahuje ZeroServer
        self.aggClient.registerMsg()
        self.server.checkConnection()
        self.aggClient.checkRegister()
        while self.run:
            try:
                msg = self.server.recvMsg()
                self.selectAction(msg)
            # Kontrola fronty ak neprisla ziadna sprava
            except UserWarning:
                if self.testQueue:
                    self.checkQueue()

        self.logger.info('Stopped (run: %s)' % self.run)

# Spravca beziaceho testu
class Test(Thread):
    def initZeroClient(self):
        self.aggClient = ZeroClient(name=self.name)

    def __init__(self, msg):
        Thread.__init__(self)
        # Priecinok kde budu ulozene screenshoty z testov
        self.baseImgDir = './screenshot'
        self.appId = msg['appId']
        self.scenarioId = msg['scenarioId']
        self.initZeroClient()
        self.logger = logging.getLogger('{}-{}'.format(self.name, self.scenarioId))
        self.logger.info('Initialized')

    # Ziskanie udalosti pre scenar
    def getTest(self):
        result = self.aggClient.sendCommand('getTestInternal',  {'appId': self.appId, 'scenarioId': self.scenarioId})
        if not result['status']:
            raise RuntimeError(testState.FAILED)

        self.manage = result['data']['manage']
        self.scenario = result['data']['scenario']

    # Nastavenie stavu testu
    def setState(self, state, testId=0):
        self.aggClient.sendCommand('setTestState',
                {'appId': self.appId, 'scenarioId': self.scenarioId, 'testId': testId, 'state': state.value})

    # Hlavny cyklus
    def run(self):
        self.setState(testState.INITIALIZE)
        try:
            self.getTest()
            self.setState(testState.TESTING)
            # Replikacie udalosti
            test = seleniumClient(self.aggClient, self.appId, self.scenarioId, self.manage, self.scenario, self.baseImgDir)
            currentId, regressId = test.run()
            self.setState(testState.ANALYZE, currentId)
            # Uspanie kvoli zaindexovaniu vsetkych vysledkov v DB
            sleep(5)
            analyze = analyzeScreenshot(self.aggClient, self.appId, self.scenarioId, regressId, currentId)
            # Nastavenie vysledku testu + analyza
            self.setState(analyze.analyze(), currentId)
        except RuntimeError as e:
            self.setState(e.args[0])
