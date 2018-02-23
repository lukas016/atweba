from elasticsearch import Elasticsearch
from pprint import pprint

class ElasticsearchClient():
    def __init__(self, host="127.0.0.1", port=9200, ssl=False):
        self.db = self.connect(host, port, ssl)
        self.manageIndex = 'manage'

    def connect(self, host, port, ssl):
        return Elasticsearch(['{}:{}'.format(host, port)],
                use_ssl=ssl)

    def createEvent(self, msg):
        result = self.db.index(index=msg['scenarioId'], doc_type='tweet', body=msg)
        return result['_shards']['failed'] != 0

    def createScenario(self, msg):
        docType = '_doc'
        id = msg['id']
        if self.db.exists(index=self.manageIndex, doc_type=docType, id=id):
            raise Exception('Invalid name ' + id + ': name exist')

        del msg['id']
        result = self.db.index(index=self.manageIndex, doc_type=docType, id=id, body=msg);
        return result['_shards']['failed'] == 0

    def delete(self, type, msg): pass
    def update(self, type, msg): pass
    def getScenario(self, msg):
        if 'id' in msg:
            query = {'terms': {'_id': [msg['id']]} }
        else:
            query = {'match_all': {}}

        result = self.db.search(index=self.manageIndex, body=query)
        if 'error' in result:
            raise Exception(result['error']['reason'])

        return result['hits']
