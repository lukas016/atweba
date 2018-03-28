from graphene import  ObjectType, String, Int
from graphene.types.datetime import Date
from graphql import GraphQLError
from pprint import pprint

class Scenario(ObjectType):
    scenarioId = String()
    events = Int()
    lastTestId = Int()
    regressTestId = Int()
    name = String()

    def get(self, aggClient, argv):
        response = aggClient.sendCommand('getScenarios', argv)
        pprint(response)
        if response['status']:
            return map(lambda x : Scenario(x['scenarioId'], x['events'], x['lastTestId'], x['regressTestId'], x['name']),
                    response['data'])
        else:
            raise GraphQLError(response['error'])

