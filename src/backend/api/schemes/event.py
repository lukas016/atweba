##
# @file event.py
# @author Lukas Koszegy
# @brief Abstraktny datovy typ udalost a funkcie s nim spojene
##

from graphene import  Mutation, ObjectType, List, String, Int, Float, ID, Boolean
from graphql import GraphQLError

class Event(ObjectType):
    scenarioId = ID(required=True, description="Scenario identifier")
    type = String(required=True)
    path = List(String, required=True)
    timestamp = Float(required=True, description="Timestampt of event")
    locator = String(required=True)
    url = String(required=True)
    content = String(required=False)
    screenX = Int(required=True)
    screenY = Int(required=True)
    pageTime = Float(required=True)

    # Ziskanie zoznamu udalosti vramci scenara
    def getTest(self, aggClient, argv):
        response = aggClient.sendCommand('getTest', argv)
        answer = []
        if response['status']:
            for item in response['data']:
                tmpObj = Event(item['scenarioId'], item['type'], item['path'], item['timestamp'],
                                item['locator'], item['url'], item['screenX'], item['screenY'], item['pageTime'])
                if 'content' in item:
                    tmpObj.content = item['content']

                answer.append(tmpObj)
        else:
            raise GraphQLError(response['error'])

        return answer

# Pridanie novej udalosti pre scenar
class createEvent(Mutation):
    class Arguments:
        appId = ID(required=True, description="Scenario identifier")
        scenarioId = ID(required=True, description="Scenario identifier")
        type = String(required=True)
        path = List(String, required=True)
        timestamp = Float(required=True, description="Timestampt of event")
        locator = String(required=True)
        url = String(required=True)
        content = String(required=False)
        screenX = Int(required=True)
        screenY = Int(required=True)
        pageTime = Float(required=True)

    ok = Boolean()

    def mutate(self, info, **argv):
        response = info.context['aggClient'].sendCommand('createEvent', argv)
        if response['status']:
            ok = True
        else:
            raise GraphQLError(response['error'])
        return createEvent(ok=ok)
