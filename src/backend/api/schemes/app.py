from graphene import  Mutation, ObjectType, List, String, Int, Float, ID, Boolean
from graphene.types.datetime import Date
from graphql import GraphQLError
from pprint import pprint
import os.path
import json


class App(ObjectType):
    id = String(required=True, description="App identifier")
    domain = String()
    created = String(description="Timestampt of event")
    lastTest = Int()

    def get(self, aggClient, argv):
        response = aggClient.sendCommand('getApp', argv)
        pprint(response)
        if response['status']:
            return self.generateApp(response['data'])
        else:
            raise GraphQLError(response['error'])

    def generateApp(self, data):
        result = []
        for it in data:
            result.append(App(it['id'], it['domain'], it['created']))

        return result

    def deleteApp(self, aggClient, argv):
        response = aggClient.sendCommand('deleteApp', argv)
        pprint(response)
        if response['status']:
            return response['status']
        else:
            raise GraphQLError(response['error'])

class createApp(Mutation):
    class Arguments:
        id = String(required=True)
        domain = String(required=True)
        created = String(required=True)

    ok = Boolean()

    def mutate(self, info, **argv):
        response = info.context['aggClient'].sendCommand('createApp', argv)
        if response['status']:
            ok = True
        else:
            raise GraphQLError(response['error'])
        return createApp(ok=ok)

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
