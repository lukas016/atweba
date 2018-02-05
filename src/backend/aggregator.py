from threading import Thread
import zmq
import time
from json import dumps, loads
from pprint import pprint
import logging

class Aggregator(Thread):
    def initZeroMQ(self):
        self.__name = 'aggregator'
        self.context = zmq.Context().instance()
        self.socket = self.context.socket(zmq.REP)
        self.socket.bind('inproc://aggregator')
        self.logger = logging.getLogger(self.__name)
        self.modules = {}

    def run(self):
        self.initZeroMQ()
        while True:
            msgObject = self.socket.recv_pyobj()
            self.logger.debug(msgObject)
            if msgObject['msg']['type'] == 'register':
                self.registerModule(msgObject['sender'])

            self.sendMsg({'result': 'ok'})

    def registerModule(self, module):
        if not(module in self.modules):
            self.modules[module] = zmq.Context().socket(zmq.PAIR)
            self.modules[module].connect("inproc://%s" % module)
            self.modules[module].send_pyobj({'sender': self.__name})
            self.modules[module].send_pyobj({'sender': self.__name})

    def readMsg(self):
        self.socket_recv

    def sendMsg(self, msg):
        msgObject = {'msg': msg}
        self.socket.send_pyobj(msgObject)


class AggregatorZmq:
    def __init__(self, name):
        self.aggregatorAddr = "inproc://aggregator"
        self.__name = name
        self.register()

    def register(self):
        context = zmq.Context().instance()
        self.socket = context.socket(zmq.REQ)
        self.socket.connect(self.aggregatorAddr)
        print(self.socket)
        self.sendMsg({'type': 'register'})

    def sendMsg(self, msg):
        msgObject = {'sender': self.__name, 'msg': msg}
        self.socket.send_pyobj(msgObject)
        result = self.socket.recv_pyobj()
        if result == {'result': 'ok'}:
            return False

        print(result)
        return True

