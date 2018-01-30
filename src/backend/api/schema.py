import graphene

class Query(graphene.ObjectType):
    hello = graphene.String(description='A typical hello worl')
    hi = graphene.String(description='A typical',
            name=graphene.String(default_value=""),
            praca=graphene.String(default_value=""))
    def resolve_hello(self, info):
        return 'TEST';

    def resolve_hi(self, info, name, praca):
        return 'HI %s' % (name or praca);

schema = graphene.Schema(query=Query)
