from database.elasticsearch import ElasticsearchClient
from pprint import pprint

class DataManager():
    def __init__(self, databaseType='ElasticsearchClient', **argv):
        super(eval(databaseType), self).__init__(argv)

    def insert(self, tdype, values):
        print(self.type())
        pprint(values)
