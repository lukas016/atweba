from threading import Thread
import time
from pprint import pprint
from zeromq import ZeroClient, ZeroServer
import logging
from manager.selenium import seleniumClient

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

    def selectAction(self, msg):
        try:
            getattr(self, 'action_%s' % msg['type'])(msg)
        except Exception as e:
            self.server.sendMsg(msg['type'], {'status': False, 'error': str(e)})

    def action_runTest(self, msg):
        self.server.sendMsg(msg['type'], {'status': True, 'data': 'running'})
        pprint(msg)
        test = seleniumClient(self.aggClient, msg['msg']['scenario'])
        test.run()

    def run(self):
        self.init()
        self.aggClient.registerMsg()
        self.server.checkConnection()
        self.aggClient.checkRegister()
        while self.run:
            try:
                msg = self.server.recvMsg()
                self.selectAction(msg)
            except UserWarning:
                pass
        self.logger.info('Stopped (run: %s)' % self.run)
