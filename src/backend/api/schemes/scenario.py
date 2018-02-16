from graphene import  Mutation, ObjectType, List, String, Int, Float, ID, Boolean

class Scenario(ObjectType):
    id = ID(required=True, description="Scenario identifier")
    domain = String(required=True)
    created = Int(required=True, description="Timestampt of event")

class createScenario(Mutation):
    class Arguments:
        domain = String(required=True)
        created = Int(String, required=True)

    ok = Boolean()

    def mutate(self, info, **argv):
        if info.context['aggClient'].sendCommand('createScenario', argv):
            ok = True
        else:
            ok = False
        ok = True
        return createScenario(ok=ok)
