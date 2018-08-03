##
# @file manager.py
# @author Lukas Koszegy
# @brief Implementacia rozhrania pre databazu
##

from database.elasticsearch import ElasticsearchClient
from abc import ABC, abstractmethod

# Vyber databazy pomocou funkcie
def getDatabasesType(type='elasticsearch'):
    databases = {'elasticsearch': ElasticsearchClient}
    return databases[type]

# Vytvorenie rozhrania
def createDataManager(instance, **argv):
    class DataManager(instance, DataManagerInterface): pass

    return DataManager(**argv)

# Zakladna definicia rozhrania
class DataManagerInterface(ABC):
    @abstractmethod
    def delete(self, type, msg):
        raise NotImplementedError('subclasses must override delete()!')

    @abstractmethod
    def createEvent(self, type, msg):
        raise NotImplementedError('subclasses must override insert()!')

    @abstractmethod
    def deleteApp(self, type, msg):
        raise NotImplementedError('subclasses must override insert()!')


    @abstractmethod
    def update(self, type, msg):
        raise NotImplementedError('subclasses must override update()!')

    @abstractmethod
    def createApp(self, msg):
        raise NotImplementedError('subclasses must override createScenario()!')

    @abstractmethod
    def getTest(self, msg):
        raise NotImplementedError('subclasses must override createScenario()!')

    @abstractmethod
    def getApp(self, msg):
        raise NotImplementedError('subclasses must override createScenario()!')
