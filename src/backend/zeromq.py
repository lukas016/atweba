import zmq
import logging
from json import dumps
from time import sleep

class ZeroServer():
    def __init__(self, name):
        self.__name = name
        self.context = zmq.Context().instance()
        self.socket = self.context.socket(zmq.REP)
        self.logger = logging.getLogger(self.__name)
        self.socket.bind('inproc://%s' % self.__name)

    def sendMsg(self, type, msg):
        msgObject = {
                'from': self.__name,
                'type': type,
                'msg': msg}
        self.logger.debug('SEND: ' + dumps(msgObject))
        self.socket.send_pyobj(msgObject)

    def recvMsg(self):
        msgObject = self.socket.recv_pyobj()
        self.logger.debug('RECEIVE: ' + dumps(msgObject))
        if msgObject['to'] != self.__name:
            raise Exception('communication', 'Invalid receiver',  msgObject)

        return msgObject

    def checkConnection(self):
        msg = self.recvMsg()
        if msg['from'] != 'aggregator':
            raise Exception('communication', 'Invalid sender', msg)

        if msg['type'] != 'ping':
            raise Exception('communication', 'Invalid message type', msg)

        self.sendMsg('ping', {'status': True})

class ZeroClient():
    def __init__(self, name, serverAddr='aggregator'):
        self.__name = name
        self.__serverAddr = serverAddr
        self.logger = logging.getLogger(self.__name)
        self.socketSrv = zmq.Context().instance().socket(zmq.REQ)
        self.socketSrv.connect('inproc://%s' % self.__serverAddr)

    def registerMsg(self):
        self.sendMsg('registerModule', {})

    def checkConnection(self):
        self.sendMsg('ping', {})
        msg = self.recvMsg()

        if msg['type'] != 'ping':
            raise Exception('communication', 'Invalid message type', msg)

        return msg['msg']['status']


    def checkRegister(self):
        msg = self.recvMsg()
        if not msg['msg']['status']:
            raise Exception('communication', 'Cannot register module')

    def sendMsg(self, type, msg):
        msgObject = {
                'from': self.__name,
                'to': self.__serverAddr,
                'type': type,
                'msg': msg}
        self.logger.debug('SEND: ' + dumps(msgObject))
        self.socketSrv.send_pyobj(msgObject)

    def recvMsg(self):
        msgObject = self.socketSrv.recv_pyobj()
        self.logger.debug('RECEIVE: ' + dumps(msgObject))
        if msgObject['from'] != self.__serverAddr:
            raise Exception('communication', 'Invalid sender', msgObject)

        return msgObject
