from database.elasticsearch import ElasticsearchClient
from pprint import pprint

def getDatabasesType(type='elasticsearch'):
    databases = {'elasticsearch': ElasticsearchClient}
    return databases[type]


def createDataManager(instance, **argv):
    class DataManager(instance): pass

    return DataManager(**argv)

# class DataManager():
    # def __init__(self, databaseType='ElasticsearchClient', **argv):
        # super(eval(databaseType), self).__init__(argv)

    # def insert(self, tdype, values):
        # print(self.type())
        # pprint(values)
