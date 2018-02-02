from threading import Thread
import zmq
import time
from json import dumps

class Aggregator(Thread):
    def initZeroMQ(self):
        self.name = bytes('aggregator', 'utf-8')
        self.context = zmq.Context()
        self.socket = self.context.socket(zmq.REP)
        self.socket.bind("tcp://127.0.0.1:%s" % self.port)

    def run(self):
        self.initZeroMQ()
        while True:
            print(self.socket.recv_multipart())
            self.sendMsg(dumps({'result': 'ok'}))

    def readMsg(self):
        self.socket_recv

    def sendMsg(self, msg):
        self.socket.send_multipart([self.name, bytes(msg, 'utf-8')])

    def setPort(self, port):
        self.port = port

class AggregatorZmg:
    def __init__(self, port, name):
        self.aggregatorAddr = "tcp://127.0.0.1:%s" % port
        self.name = bytes(name, 'utf-8')
        self.register()

    def register(self):
        context = zmq.Context()
        self.socket = context.socket(zmq.REQ)
        self.socket.connect(self.aggregatorAddr)
        self.sendMsg(dumps({'type': 'register'}))

    def sendMsg(self, msg):
        self.socket.send_multipart([self.name, bytes(msg, 'utf-8')])
        ident, result = self.socket.recv_multipart()
        if result == {'result': 'ok'}:
            return False

        print(result)
        return True

