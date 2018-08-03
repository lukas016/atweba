##
# @file app.py
# @author Lukas Koszegy
# @brief Abstraktny datovy typ aplikacia a suvisiace funkcie
##

from graphene import  Mutation, ObjectType, List, String, Int, Float, ID, Boolean
from graphene.types.datetime import Date
from graphql import GraphQLError
import os.path
import json


class App(ObjectType):
    id = String(required=True, description="App identifier")
    domain = String()
    created = String(description="Timestampt of event")
    lastTest = Int()

    # Ziskanie zoznamu aplikacii
    def get(self, aggClient, argv):
        response = aggClient.sendCommand('getApp', argv)
        if response['status']:
            return self.generateApp(response['data'])
        else:
            raise GraphQLError(response['error'])

    # Generovanie zoznamu aplikacii
    def generateApp(self, data):
        result = []
        for it in data:
            result.append(App(it['id'], it['domain'], it['created']))

        return result

    # Zmazanie aplikacie !TODO presunut do mutacii
    def deleteApp(self, aggClient, argv):
        response = aggClient.sendCommand('deleteApp', argv)
        if response['status']:
            return response['status']
        else:
            raise GraphQLError(response['error'])

# Zaregistrovanie novej aplikacie
class createApp(Mutation):
    class Arguments:
        id = String(required=True)
        domain = String(required=True)
        created = String(required=True)

    ok = Boolean()

    def mutate(self, info, **argv):
        response = info.context['aggClient'].sendCommand('createApp', argv)
        if response['status']:
            ok = True
        else:
            raise GraphQLError(response['error'])
        return createApp(ok=ok)

# Vygenerovanie klientskeho skriptu pre aplikaciu
def generateClientScript(argv):
    id = argv['id']
    pathStart = './'
    urlPart =  'client/client'
    fileFormat = '.js'
    pathBase = pathStart + urlPart
    pathTarget = pathBase + '-' + id + fileFormat
    if not os.path.isfile(pathTarget):
        with open(pathBase + fileFormat, 'r') as file:
            # Nacitanie sablony
            data = file.read()

            # Nastavenie identifikatoru aplikacie
            with open(pathTarget, 'w') as output:
                output.write(data.replace('replace-with-scenario-id', id))

    # Vratenie relativnej cesty ku skriptu pre webove rozhranie
    return urlPart + '-' + id + fileFormat
