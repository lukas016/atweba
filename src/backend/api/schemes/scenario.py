from graphene import  Mutation, ObjectType, List, String, Int, Float, ID, Boolean
from graphene.types.datetime import Date
from graphql import GraphQLError
from pprint import pprint
import os.path
import json


class Scenario(ObjectType):
    id = String(required=True, description="Scenario identifier")
    domain = String()
    created = String(description="Timestampt of event")

    def get(self, aggClient, argv):
        response = aggClient.sendCommand('getScenario', argv)
        pprint(response)
        if response['status']:
            return self.generateScenarios(response['data'])

    def generateScenarios(self, data):
        result = []
        for it in data:
            result.append(Scenario(it['id'], it['domain'], it['created']))

        return result

class createScenario(Mutation):
    class Arguments:
        id = String(required=True)
        domain = String(required=True)
        created = String(required=True)

    ok = Boolean()

    def mutate(self, info, **argv):
        response = info.context['aggClient'].sendCommand('createScenario', argv)
        if response['status']:
            ok = True
        else:
            raise GraphQLError(response['error'])
        return createScenario(ok=ok)

def generateClientScript(argv):
    id = argv['id']
    pathStart = '..'
    urlPart =  '/client/eventHandler/build/client'
    fileFormat = '.js'
    pathBase = pathStart + urlPart
    pathTarget = pathBase + '-' + id + fileFormat
    if not os.path.isfile(pathTarget):
        with open(pathBase + fileFormat, 'r') as file:
            data = file.read()

            with open(pathTarget, 'w') as output:
                output.write(data.replace('replace-with-scenario-id', id))

    return urlPart + '-' + id + fileFormat
