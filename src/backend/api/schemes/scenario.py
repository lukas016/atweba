from graphene import Mutation, ObjectType, String, Int, ID, Boolean
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

class setScenarioName(Mutation):
    class Arguments:
        appId = ID(required=True, description="Scenario identifier")
        scenarioId = ID(required=True, description="Scenario identifier")
        name = String(required=True)

    ok = Boolean()

    def mutate(self, info, **argv):
        response = info.context['aggClient'].sendCommand('setScenarioName', argv)
        if response['status']:
            ok = True
        else:
            raise GraphQLError(response['error'])
        return setScenarioName(ok=ok)

class runTest(Mutation):
    class Arguments:
        appId = ID(required=True, description="Scenario identifier")
        scenarioId = ID(required=True, description="Scenario identifier")

    message = String()

    def mutate(self, info, **argv):
        response = info.context['aggClient'].sendCommand('runTest', argv)
        if response['status']:
            message = response['data']
        else:
            raise GraphQLError(response['error'])
        return runTest(message=message)
