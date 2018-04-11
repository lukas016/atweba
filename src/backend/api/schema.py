from graphene import Field, List, ObjectType, Schema, String, ID, Int
from .schemes.event import Event, createEvent
from .schemes.app import App, createApp, generateClientScript
from .schemes.scenario import Scenario, setScenarioName, runTest
from .schemes.result import Result, setRegressTest

class Query(ObjectType):
    event = List(Event)
    app = List(App, id=String())
    scenario = List(Scenario, scenarioId=ID(required=True))
    generateClientUrl = String(required=True, id=String(required=True))
    deleteApp = String(required=True, id=ID(required=True))
    getResult = List(Result, appId=ID(required=True), scenarioId=ID(required=True),
            testId=List(Int))
    getResultAgg = List(Result, appId=ID(required=True), scenarioId=ID(required=True))
    getTest = List(Event, appId=ID(required=True), scenarioId=ID(required=True))

    def resolve_app(self, info, **argv):
        return App().get(info.context['aggClient'], argv)

    def resolve_deleteApp(self, info, **argv):
        return App().deleteApp(info.context['aggClient'], argv)

    def resolve_generateClientUrl(self, info, **argv):
        return generateClientScript(argv)

    def resolve_runTest(self, info, **argv):
        return info.context['aggClient'].sendCommand('runTest', argv)

    def resolve_scenario(self, info, **argv):
        return Scenario().get(info.context['aggClient'], argv)

    def resolve_getResult(self, info, **argv):
        return Result().get(info.context['aggClient'], argv)

    def resolve_getResultAgg(self, info, **argv):
        return Result().getAgg(info.context['aggClient'], argv)

    def resolve_getTest(self, info, **argv):
        return Event().getTest(info.context['aggClient'], argv)

class Mutation(ObjectType):
    create_event = createEvent.Field()
    create_app = createApp.Field()
    set_scenario_name = setScenarioName.Field()
    set_regress_test = setRegressTest.Field()
    run_test = runTest.Field()

schema = Schema(query=Query, mutation=Mutation)
