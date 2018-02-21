from graphene import  Mutation, ObjectType, List, String, Int, Float, ID, Boolean
from graphene.types.datetime import Date
from graphql import GraphQLError

class Scenario(ObjectType):
    id = String(required=True, description="Scenario identifier")
    domain = String(required=True)
    created = Int(required=True, description="Timestampt of event")

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
