import graphene
from .schemes.event import Event, createEvent

class Query(graphene.ObjectType):
    hello = graphene.String(description='A typical hello worl')
    hi = graphene.String(description='A typical',
            name=graphene.String(default_value=""),
            praca=graphene.String(default_value=""))
    event = graphene.Field(Event)
    def resolve_hello(self, info):
        return 'TEST';

    def resolve_hi(self, info, name, praca):
        return 'HI %s' % (name or praca);

class Mutation(graphene.ObjectType):
    create_event = createEvent.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)
