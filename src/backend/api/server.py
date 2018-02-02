from flask import Flask, send_from_directory

from flask_graphql import GraphQLView
from .schema import schema

apiServer = Flask(__name__)

#GraphQL
apiServer.add_url_rule('/graphql',
        view_func=GraphQLView.as_view('graphql',
            schema=schema, graphiql=True))

@apiServer.route('/ui/<path:path>')
def root(path):
    return send_from_directory('../../frontend/build/', path)

@apiServer.route('/client/<path:path>')
def clientTesting(path):
    return send_from_directory('../../client/', path)
