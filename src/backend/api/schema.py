from graphene import Field, List, ObjectType, Schema, String
from .schemes.event import Event, createEvent
from .schemes.scenario import Scenario, createScenario, generateClientScript
from pprint import pprint

class Query(ObjectType):
    event = List(Event)
    scenario = List(Scenario, id=String())
    generateClientUrl = String(required=True, id=String(required=True))

    def resolve_scenario(self, info, **argv):
        return Scenario().get(info.context['aggClient'], argv)

    def resolve_generateClientUrl(self, info, **argv):
        return generateClientScript(argv)

class Mutation(ObjectType):
    create_event = createEvent.Field()
    create_scenario = createScenario.Field()

schema = Schema(query=Query, mutation=Mutation)
