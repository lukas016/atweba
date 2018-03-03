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

    ok = Boolean()

    def mutate(self, info, **argv):
        response = info.context['aggClient'].sendCommand('createEvent', argv)
        if response['status']:
            ok = True
        else:
            raise GraphQLError(response['error'])
        return createEvent(ok=ok)
