from graphene import Field, List, ObjectType, Schema, String
from .schemes.event import Event, createEvent
from .schemes.scenario import Scenario, createScenario
from pprint import pprint
class Query(ObjectType):
    event = List(Event)
    scenario = List(Scenario, id=String())

    def resolve_scenario(self, info, **argv):
        return Scenario().get(info.context['aggClient'], argv)

class Mutation(ObjectType):
    create_event = createEvent.Field()
    create_scenario = createScenario.Field()

schema = Schema(query=Query, mutation=Mutation)
