from elasticsearch import Elasticsearch
from pprint import pprint

class ElasticsearchClient():
    def __init__(self, host="127.0.0.1", port=9200, ssl=False):
        self.db = self.connect(host, port, ssl)
        self.manageIndex = 'manage'
        self.manageDocType = '_doc'

    def connect(self, host, port, ssl):
        return Elasticsearch(['{}:{}'.format(host, port)],
                use_ssl=ssl,
                max_retries=0)

    def createEvent(self, msg):
        appId = msg['appId']
        if not self.existScenario(appId):
            raise Exception('Invalid scenario name '+ appId)

        result = self.db.index(index=appId, doc_type='tweet', body=msg)
        return result['_shards']['failed'] != 0

    def existScenario(self, scenario):
        return self.db.exists(index=self.manageIndex, id=scenario, doc_type=self.manageDocType)

    def createScenario(self, msg):
        id = msg['id']
        if self.existScenario(id):
            raise Exception('Invalid name ' + id + ': name exist')

        del msg['id']
        result = self.db.index(index=self.manageIndex, doc_type=self.manageDocType, id=id, body=msg);
        return result['_shards']['failed'] == 0

    def delete(self, type, msg): pass
    def update(self, type, msg): pass

    def getTest(self, msg):
        answer = []
        filter=['hits.hits', 'error']
        query = {'query': {'match_all': {}}}

        result = self.db.search(index=msg['msg']['id'], body=query, filter_path=filter, request_cache=False, size=1000)
        if 'error' in result:
            raise RuntimeError(result['error']['reason'])

        for item in result['hits']['hits']:
            answer.append(item['_source'])

        return answer

    def getScenario(self, msg):
        answer = []
        filter=['hits.hits', 'error']
        if msg:
            query = {'query': {'terms': {'_id': [msg['id']] }}}
        else:
            query = {'query': {'match_all': {}}}

        result = self.db.search(index=self.manageIndex, body=query, filter_path=filter, request_cache=False, size=100)
        if 'error' in result:
            raise RuntimeError(result['error']['reason'])

        for item in result['hits']['hits']:
            answer.append({'id': item['_id'], 'domain': item['_source']['domain'],
                    'created': item['_source']['created']})
        return answer
