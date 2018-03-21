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

    def generateResult(self, data):
        result = []
        for it in data:
            tmp = Result(it['id'], it['testId'], it['image'])
            if 'test' in it:
                tmp['score'] = it['score']

            result.append(tmp)

        return result

    def get(self, aggClient, argv):
        response = aggClient.sendCommand('getResult', argv)
        pprint(response)
        if response['status']:
            return self.generateResult(response['data'])
        else:
            raise GraphQLError(response['error'])
