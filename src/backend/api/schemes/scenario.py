from graphene import  Mutation, ObjectType, List, String, Int, Float, ID, Boolean
from graphene.types.datetime import Date

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
        if info.context['aggClient'].sendCommand('createScenario', argv):
            ok = True
        else:
            ok = False
        ok = True
        return createScenario(ok=ok)
