from elasticsearch import Elasticsearch
from pprint import pprint

class ElasticsearchClient():
    def __init__(self, host="127.0.0.1", port=9200, ssl=False):
        self.db = self.connect(host, port, ssl)

    def connect(self, host, port, ssl):
        return Elasticsearch(['{}:{}'.format(host, port)],
                use_ssl=ssl)

    def insert(self, type, msg):
        result = self.db.index(index=msg['msg']['scenarioId'], doc_type='tweet', body=msg['msg'])
        return result['_shards']['failed'] != 0
