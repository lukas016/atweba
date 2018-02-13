from graphene import  Mutation, ObjectType, List, String, Int, Float, ID, Boolean

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
        scenarioId = ID(required=True, description="Scenario identifier")
        type = String(required=True)
        path = List(String, required=True)
        timestamp = Float(required=True, description="Timestampt of event")
        locator = String(required=True)
        url = String(required=True)
        content = String(required=False)

    ok = Boolean()

    def mutate(self, info, **argv):
        if info.context['aggClient'].sendCommand('createEvent', argv):
            ok = True
        else:
            ok = False
        ok = True
        return createEvent(ok=ok)
