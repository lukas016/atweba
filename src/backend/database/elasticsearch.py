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
        self.existApp(appId, False)
        msg['image'] = ''

        result = self.db.index(index=appId, doc_type='tweet', body=msg)
        return result['_shards']['failed'] == 0

    def existApp(self, appId, noexist=True):
        result = self.db.exists(index=self.manageIndex, id=appId, doc_type=self.manageDocType)
        if noexist and result:
            raise Exception('Application ' + appId + ' exist')
        if (not noexist) and (not result):
            raise Exception('Invalid application name '+ appId)

    def createApp(self, msg):
        id = msg['id']
        self.existApp(id)

        del msg['id']
        result = self.db.index(index=self.manageIndex, doc_type=self.manageDocType, id=id, body=msg);
        return result['_shards']['failed'] == 0

    def deleteApp(self, msg):
        id = msg['id']
        self.existApp(id, False)

        self.db.indices.delete(index=id, ignore=[400, 404])
        self.db.delete(index=self.manageIndex, doc_type=self.manageDocType, id=id);

        return True

    def delete(self, type, msg): pass
    def update(self, type, msg): pass

    def getTest(self, msg):
        answer = []
        filter=['hits.hits', 'error']
        query = {'query': {'term': {'scenarioId': msg['msg']['scenarioId']}}}

        result = self.db.search(index=msg['msg']['appId'], body=query, sort='timestamp', filter_path=filter, request_cache=False, size=1000)
        if 'error' in result:
            raise RuntimeError(result['error']['reason'])

        for item in result['hits']['hits']:
            answer.append(item['_source'])

        return answer

    def getApp(self, msg):
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

    def getScenarios(self, msg):
        filter=['aggs.scenarios', 'error']
        query = {'aggs': {'scenarios': {'terms': {'field': 'scenarioId.keyword'}}}}

        result = self.db.search(index=self.msg['id'], body=query, filter_path=filter, request_cache=False, size=100)
        if 'error' in result:
            raise RuntimeError(result['error']['reason'])

        return result['aggregations']['scenarios']['buckets']
