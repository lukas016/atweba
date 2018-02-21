from database.elasticsearch import ElasticsearchClient
from pprint import pprint
from abc import ABC, abstractmethod

def getDatabasesType(type='elasticsearch'):
    databases = {'elasticsearch': ElasticsearchClient}
    return databases[type]


def createDataManager(instance, **argv):
    class DataManager(instance, DataManagerInterface): pass

    return DataManager(**argv)

class DataManagerInterface(ABC):
    @abstractmethod
    def delete(self, type, msg):
        raise NotImplementedError('subclasses must override delete()!')

    @abstractmethod
    def insert(self, type, msg):
        raise NotImplementedError('subclasses must override insert()!')

    @abstractmethod
    def select(self, type, msg):
        raise NotImplementedError('subclasses must override select()!')

    @abstractmethod
    def update(self, type, msg):
        raise NotImplementedError('subclasses must override update()!')

    @abstractmethod
    def createScenario(self, msg):
        raise NotImplementedError('subclasses must override createScenario()!')
