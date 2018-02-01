from graphene import  Mutation, ObjectType, List, String, Int, Float, ID, Boolean

class Event(ObjectType):
    scenarioId = ID(required=True, description="Scenario identifier")
    type = String(required=True)
    path = List(String, required=True)
    timestamp = Float(required=True, description="Timestampt of event")

class createEvent(Mutation):
    class Arguments:
        scenarioId = ID(required=True, description="Scenario identifier")
        type = String(required=True)
        path = List(String, required=True)
        timestamp = Float(required=True, description="Timestampt of event")

    ok = Boolean()

    def mutate(self, info, **arg):
        print(arg)
        ok = True
        return createEvent(ok=ok)
