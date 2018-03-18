from elasticsearch import Elasticsearch
from pprint import pprint
from time import time

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

    def setLastResultId(self, msg):
        index = msg['appId']
        id = msg['_id']
        del msg['appId']
        del msg['_id']
        query = {'doc': msg}

        result = self.db.update(index=index, doc_type='tweet', id=id, body=query)

        return result['_shards']['failed'] == 0

    def setRegressTest(self, msg):
        id = msg['_id']
        del msg['_id']
        query = {'doc': msg}

        result = self.db.update(index=self.manageIndex, doc_type='_doc', id=id, body=query)

        return result['_shards']['failed'] == 0

    def createResult(self, msg):
        id = 'result-' + msg['appId'] + '-' + msg['scenarioId']
        del msg['appId']
        del msg['scenarioId']
        result = self.db.create(index=id, doc_type='result', id=time(), body=msg)

        return result['_shards']['failed'] == 0

    def getTest(self, msg):
        answer = []
        filter=['hits.hits', 'error']
        query = {'query': {'term': {'scenarioId': msg['msg']['scenarioId']}}}

        result = self.db.search(index=msg['msg']['appId'], body=query, sort='timestamp', filter_path=filter, request_cache=False, size=1000)
        if 'error' in result:
            raise RuntimeError(result['error']['reason'])

        for item in result['hits']['hits']:
            item['_source']['_id'] = item['_id']
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
        answer = []
        filter=['aggregations.scenarios', 'error']
        query = {'size': 0, 'aggs': {'scenarios': {'terms': {'field': 'scenarioId.keyword'}}}}

        result = self.db.search(index=msg['scenarioId'], body=query, filter_path=filter, request_cache=False, size=100)
        if 'error' in result:
            raise RuntimeError(result['error']['reason'])

        for item in result['aggregations']['scenarios']['buckets']:
            answer.append({'scenarioId': item['key'], 'events': item['doc_count']})

        return answer
