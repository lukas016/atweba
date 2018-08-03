##
# @file zeromq.py
# @author Lukas Koszegy
# @brief Implementacia zeroMQ pre potreby aplikacie
##

import zmq
import logging
from threading import Lock
from json import dumps
from time import sleep

##
# @brief Serverova implementacia zeroMQ, ktora caka na dotazy
##
class ZeroServer():
    def __init__(self, name):
        self.__name = name
        self.context = zmq.Context().instance()
        self.socket = self.context.socket(zmq.REP)
        self.logger = logging.getLogger(self.__name)
        self.socket.bind('inproc://%s' % self.__name)
        self.poller = zmq.Poller()
        self.poller.register(self.socket, zmq.POLLIN)

    # Zaslanie spravy a nastavenie odosielatela
    def sendMsg(self, type, msg):
        msgObject = {
                'from': self.__name,
                'type': type,
                'msg': msg}
        self.logger.debug('SEND: ' + dumps(msgObject))
        self.socket.send_pyobj(msgObject)

    # Prijatie spravy
    def recvMsg(self):
        event = self.poller.poll(2000) #timeout 2s
        if isinstance(event, list):
            if not event:
                raise UserWarning('No messages')

            (fd, _) = event[0]
        else:
            fd = event

        msgObject = fd.recv_pyobj()
        self.logger.debug('RECEIVE: ' + dumps(msgObject))

        if msgObject['to'] != self.__name: # Kontrola prijemcu
            raise Exception('communication', 'Invalid receiver',  msgObject)

        return msgObject

    # Kontrola spojenia pri registracii servera v aggregatore
    def checkConnection(self):
        msg = self.recvMsg()
        if msg['from'] != 'aggregator':
            raise Exception('communication', 'Invalid sender', msg)

        if msg['type'] != 'ping':
            raise Exception('communication', 'Invalid message type', msg)

        self.sendMsg('ping', {'status': True})

##
# @brief Klientska implementacia zeroMQ, zasiela poziadavky na server
##
class ZeroClient():
    def __init__(self, name, serverAddr='aggregator'):
        self.__name = name
        self.__serverAddr = serverAddr
        self.logger = logging.getLogger(self.__name)
        self.socketSrv = zmq.Context().instance().socket(zmq.REQ)
        self.socketSrv.connect('inproc://%s' % self.__serverAddr)
        self.sendMsgMutex = Lock()

    # Registracna sprava dava vediet aggregatoru ze modul obsahuje aj server
    def registerMsg(self):
        self.sendMsg('registerModule', {})

    # Par k funkcii zo servera
    def checkConnection(self):
        self.sendMsg('ping', {})
        msg = self.recvMsg()

        if msg['type'] != 'ping':
            raise Exception('communication', 'Invalid message type', msg)

        return msg['msg']['status']

    # Overenie registracie
    def checkRegister(self):
        msg = self.recvMsg()
        if not msg['msg']['status']:
            raise Exception('communication', 'Cannot register module')

    # Zapuzdrenie odoslanie spravy a prijatie odpovede
    def sendCommand(self, type, msg):
        with self.sendMsgMutex:
            self.sendMsg(type, msg)
            result = self.recvMsg()['msg']

        return result

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
