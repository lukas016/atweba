##
# @file result.py
# @author Lukas Koszegy
# @brief Abstraktny datovy typ Vysledok a funkcie s nim spojene
##

from graphene import  Mutation, ObjectType, List, String, Int, Float, ID, Boolean
from graphene.types.datetime import Date
from graphql import GraphQLError
import os.path
import json


class Result(ObjectType):
    id = String(required=True)
    testId = Int(required=True)
    image = String(required=True)
    score = Float()
    events = Int()
    regressTestId = Int()
    state = Int()
    performTime = Float()

    # Konvertiovanie do abstraktneho typu Vysledok
    def generateResult(self, data):
        result = []
        for it in data:
            result.append(Result(**it))

        return result

    # Konvertiovanie do abstraktneho typu Vysledok s agregovanymi hodnotami
    def generateResultAgg(self, data):
        result = []
        for item in data:
            result.append(Result(**item))

        return result

    # Ziskanie vysledkov
    def get(self, aggClient, argv):
        response = aggClient.sendCommand('getResult', argv)
        if response['status']:
            return self.generateResult(response['data'])
        else:
            raise GraphQLError(response['error'])

    # Ziskanie vysledkov s agregovanymi hodnotami
    def getAgg(self, aggClient, argv):
        response = aggClient.sendCommand('getResultAgg', argv)
        if response['status']:
            return self.generateResultAgg(response['data'])
        else:
            raise GraphQLError(response['error'])

# Zmena regresneho testu pre scenar
class setRegressTest(Mutation):
    class Arguments:
        appId = ID(required=True, description="Scenario identifier")
        scenarioId = ID(required=True, description="Scenario identifier")
        testId = Int(required=True)

    status = Boolean()

    def mutate(self, info, **argv):
        response = info.context['aggClient'].sendCommand('setRegressTest', argv)
        if not response['status']:
            raise GraphQLError(response['error'])
        return setRegressTest(status=response['status'])
