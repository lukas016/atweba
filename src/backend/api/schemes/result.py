from graphene import  Mutation, ObjectType, List, String, Int, Float, ID, Boolean
from graphene.types.datetime import Date
from graphql import GraphQLError
from pprint import pprint
import os.path
import json


class Result(ObjectType):
    id = String(required=True)
    testId = Int(required=True)
    image = String(required=True)
    score = Float()
    events = Int()
    regressTestId = Int()
    state = Int()

    def generateResult(self, data):
        result = []
        for it in data:
            tmp = Result(it['id'], it['testId'], it['image'])
            if 'score' in it:
                tmp.score = it['score']

            result.append(tmp)

        return result

    def generateResultAgg(self, data):
        result = []
        for item in data:
            result.append(Result(testId=item['testId'], events=item['events'], regressTestId=item['regressTestId'],
                    state=item['state']))

        return result

    def get(self, aggClient, argv):
        response = aggClient.sendCommand('getResult', argv)
        pprint(response)
        if response['status']:
            return self.generateResult(response['data'])
        else:
            raise GraphQLError(response['error'])

    def getAgg(self, aggClient, argv):
        response = aggClient.sendCommand('getResultAgg', argv)
        if response['status']:
            return self.generateResultAgg(response['data'])
        else:
            raise GraphQLError(response['error'])

class setRegressTest(Mutation):
    class Arguments:
        appId = ID(required=True, description="Scenario identifier")
        scenarioId = ID(required=True, description="Scenario identifier")
        testId = Int(required=True)

    status = Boolean()

    def mutate(self, info, **argv):
        response = info.context['aggClient'].sendCommand('setRegressTest', argv)
        if not response['status']:
            raise GraphQLError(response['error'])
        return setRegressTest(status=response['status'])
