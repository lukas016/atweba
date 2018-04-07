from elasticsearch import Elasticsearch
import json
from pprint import pprint
from time import time
from database.schemes.mapping import mappingApp, mappingEvent

class ElasticsearchClient():
    def __init__(self, host="127.0.0.1", port=9200, ssl=False):
        self.db = self.connect(host, port, ssl)
        self.manageIndex = 'manage'
        self.manageDocType = 'app'
        self.eventDocType = 'event'
        try:
            self.initManageIndex()
        except:
            assert('Cannot init manage index in database')

    def initManageIndex(self):
        if self.db.indices.exists(index=self.manageIndex):
            return

        self.db.indices.create(index=self.manageIndex)

        self.db.indices.put_mapping(index=self.manageIndex, doc_type=self.manageDocType, body=mappingApp)

    def connect(self, host, port, ssl):
        return Elasticsearch(['{}:{}'.format(host, port)],
                use_ssl=ssl,
                max_retries=0)

    def createEvent(self, msg):
        appId = msg['appId']
        self.existApp(appId, False)

        result = self.db.index(index=appId, doc_type=self.eventDocType, body=msg)
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

        self.db.indices.create(index=id)
        self.db.indices.put_mapping(index=id, doc_type=self.eventDocType, body=mappingEvent)

        return result['_shards']['failed'] == 0

    def deleteApp(self, msg):
        id = msg['id']
        self.existApp(id, False)

        self.db.indices.delete(index=id, ignore=[400, 404])
        self.db.indices.delete(index='result-{}-*'.format(id), expand_wildcards='all', ignore=[400, 404])
        self.db.delete(index=self.manageIndex, doc_type=self.manageDocType, id=id);

        return True

    def delete(self, type, msg): pass
    def update(self, type, msg): pass

    def setLastTestId(self, msg):
        query = {'doc': { 'scenarios': { msg['scenarioId']: { 'lastTestId': msg['testId']}}}}

        result = self.db.update(index=self.manageIndex, doc_type=self.manageDocType, id=msg['appId'], body=query)

        return result['_shards']['failed'] == 0

    def setTestState(self, msg):
        query = {'doc': {'scenarios': {msg['scenarioId']: {'state': msg['state']}}}}
        if msg['testId'] != 0:
            query['doc']['scenarios'][msg['scenarioId']]['tests'] = {msg['testId']: {'state': msg['state']}}

        result = self.db.update(index=self.manageIndex, doc_type=self.manageDocType, id=msg['appId'], body=query)

        return result['_shards']['failed'] == 0

    def setRegressTest(self, msg):
        query = {'doc': {'scenarios': {msg['scenarioId']: {'regressTestId': msg['testId']}}}}

        result = self.db.update(index=self.manageIndex, doc_type=self.manageDocType, id=msg['appId'], body=query)

        return result['_shards']['failed'] == 0

    def setRegressTestForTest(self, msg):
        result = self.db.update(index=self.manageIndex, doc_type=self.manageDocType, id=msg['appId'],
                body={'doc': {'scenarios': {msg['scenarioId']: {'tests': {msg['testId']:
                    {'regressTestId': msg['regressTestId']}}}}}})

        return result['_shards']['failed'] == 0

    def setScenarioName(self, msg):
        query = {'doc': {'scenarios': {msg['scenarioId']: {'name': msg['name']}}}}

        result = self.db.update(index=self.manageIndex, doc_type=self.manageDocType, id=msg['appId'], body=query)

        return result['_shards']['failed'] == 0

    def createTest(self, msg):
        id = 'result-' + msg['appId'] + '-' + msg['scenarioId']
        del msg['appId']
        del msg['scenarioId']
        result = self.db.create(index=id, doc_type='result', id=time(), body=msg)

        return result['_shards']['failed'] == 0

    def getResultAgg(self, msg):
        resultIndex = 'result-{}-{}'.format(msg['appId'], msg['scenarioId'])
        indexes = '{},{}'.format(self.manageIndex, resultIndex)

        query = ('{"index": "' + self.manageIndex + '"}\n'
                    '{"query": {"term": {"_id": "' + msg['appId'] + '"}}}\n'
                    '{"index": "' + resultIndex + '"}\n'
                    '{"size": 0, "aggs": {"results": {"terms": {"field": "testId", "size": 10000}}}}\n'
                )
        filter = ['responses.hits.hits', 'responses.aggregations.results', 'error']
        result = self.db.msearch(index=indexes, filter_path=filter, body=query)

        if 'error' in result:
            raise RuntimeError(result['error']['reason'])

        answer = []
        if not 'scenarios' in result['responses'][0]['hits']['hits'][0]['_source']:
            return answer

        generalInfo = result['responses'][0]['hits']['hits'][0]['_source']['scenarios'][msg['scenarioId']]['tests']
        bucketIter = result['responses'][1]['aggregations']['results']['buckets']
        for item in bucketIter:
            testInfo = generalInfo[str(item['key'])]
            answer.append({'testId': item['key'], 'events': item['doc_count'], 'regressTestId':
                testInfo['regressTestId'], 'state': testInfo['state']})

        return answer

    def getResult(self, msg):
        index = 'result-{}-{}'.format(msg['appId'], msg['scenarioId'])
        filter = ['hits.hits', 'error']
        if 'testId' in msg:
            query = {'query': {'terms': {'testId': msg['testId']}}}
        else:
            query = {'query': {'match_all': {}}}

        result = self.db.search(index=index, filter_path=filter,
                body=query)

        if 'error' in result:
            raise RuntimeError(result['error']['reason'])

        answer = []
        for item in result['hits']['hits']:
            tmp = {'id': item['_id']}
            for key, value  in item['_source'].items():
                tmp[key] = value
            answer.append(tmp)

        answer.sort(key=lambda x: x['id'])
        return answer

    def setImgScore(self, msg):
        index = 'result-{}-{}'.format(msg['appId'], msg['scenarioId'])
        id = msg['id']
        query = {'doc': {'score': msg['score'], 'regressTestId': msg['regressTestId']}}
        result = self.db.update(index=index, doc_type='result', id=id, body=query)

        return result['_shards']['failed'] == 0

    def getTest(self, msg):
        answer = []
        indexes = self.manageIndex + ',' + msg['appId']
        filter=['responses.hits', 'error']
        query = ('{"index": "' + self.manageIndex + '"}\n'
                    '{"query": {"exists": {"field": "scenarios.' + msg['scenarioId'] + '"}}}\n'
                    '{"index": "' + msg['appId'] + '"}\n'
                    '{"query": {"term": {"scenarioId": "' + msg['scenarioId'] + '"}}}\n'
                )

        result = self.db.msearch(index=indexes, body=query, filter_path=filter)
        if 'error' in result:
            raise RuntimeError(result['error']['reason'])

        manage = None
        pprint(result['responses'][0]['hits']['total'])
        if result['responses'][0]['hits']['total'] != 0:
            manage = result['responses'][0]['hits']['hits'][0]['_source']['scenarios'][msg['scenarioId']]

        for item in result['responses'][1]['hits']['hits']:
            item['_source']['_id'] = item['_id']
            answer.append(item['_source'])

        answer.sort(key=lambda x: x['timestamp'])
        return (manage, answer)

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
        indexes = '{},{}'.format(self.manageIndex, msg['scenarioId'])
        filter=['responses.aggregations.scenarios', 'responses.hits', 'error']
        query = ('{"index": "' + self.manageIndex + '"}\n'
                    '{"query": {"term": {"_id": "' + msg['scenarioId'] + '"}}}\n'
                    '{"index": "' + msg['scenarioId'] + '"}\n'
                    '{"size": 0, "aggs": {"scenarios": {"terms": {"field": "scenarioId.keyword"}}}}\n'
                )

        result = self.db.msearch(index=indexes, body=query, filter_path=filter)
        if 'error' in result:
            raise RuntimeError(result['error']['reason'])

        testInfoIter = []
        if 'scenarios' in result['responses'][0]['hits']['hits'][0]['_source']:
            testInfoIter = result['responses'][0]['hits']['hits'][0]['_source']['scenarios']

        bucketIter = result['responses'][1]['aggregations']['scenarios']['buckets']
        noExistInfo = {'lastTestId': 0, 'regressTestId': 0, 'name': '', 'state': -1}
        for item in bucketIter:
            tmpObj = {'scenarioId': item['key'], 'events': item['doc_count']}
            tmpObj.update(noExistInfo)
            if item['key'] in testInfoIter:
                tmpObj.update(testInfoIter[item['key']])

            if 'tests' in tmpObj:
                del tmpObj['tests']

            answer.append(tmpObj)

        return answer
