from graphene import  Mutation, ObjectType, List, String, Int, Float, ID, Boolean
from aggregator import AggregatorZmg

class Event(ObjectType):
    scenarioId = ID(required=True, description="Scenario identifier")
    type = String(required=True)
    path = List(String, required=True)
    timestamp = Float(required=True, description="Timestampt of event")
    locator = String(required=True)

class createEvent(Mutation):
    class Arguments:
        scenarioId = ID(required=True, description="Scenario identifier")
        type = String(required=True)
        path = List(String, required=True)
        timestamp = Float(required=True, description="Timestampt of event")
        locator = String(required=True)

    ok = Boolean()

    def mutate(self, info, **argv):
        aggClient = AggregatorZmg(5901, 'api')
        agg = AggregatorZmg(5901, 'api2')
        if aggClient.sendMsg(argv):
            ok = True
        else:
            ok = False
        return createEvent(ok=ok)
