from threading import Thread
from aggregator import AggregatorZmq
import zmq
import time
from pprint import pprint
class TestManager(Thread):
    def init(self):
        self.__name = 'manager'
        self.__context = zmq.Context().instance()
        self.__socket = self.__context.socket(zmq.PAIR)
        self.__socket.bind("inproc://%s" % self.__name)
        self.__aggClient = AggregatorZmq(self.__name)

    def run(self):
        self.init()
        msgObject = self.__socket.recv_pyobj()
        print(self.__name + ":")
        pprint(msgObject)
        time.sleep(120)
