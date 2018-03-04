from graphene import Field, List, ObjectType, Schema, String, ID
from .schemes.event import Event, createEvent
from .schemes.app import App, createApp, generateClientScript
from pprint import pprint

class Query(ObjectType):
    event = List(Event)
    app = List(App, id=String())
    generateClientUrl = String(required=True, id=String(required=True))
    runTest = String(appId=ID(required=True), scenarioId=ID(required=True))

    def resolve_app(self, info, **argv):
        return App().get(info.context['aggClient'], argv)

    def resolve_generateClientUrl(self, info, **argv):
        return generateClientScript(argv)

    def resolve_runTest(self, info, **argv):
        return info.context['aggClient'].sendCommand('runTest', argv)

class Mutation(ObjectType):
    create_event = createEvent.Field()
    create_app = createApp.Field()

schema = Schema(query=Query, mutation=Mutation)
