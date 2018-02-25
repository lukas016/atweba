from flask import Flask, send_from_directory, make_response, send_file

from flask_graphql import GraphQLView
from .schema import schema
from zeromq import ZeroClient

apiServer = Flask(__name__)

#GraphQL
apiServer.add_url_rule('/graphql',
        view_func=GraphQLView.as_view('graphql',
            schema=schema, graphiql=True, context={'aggClient': ZeroClient('apiServer')}))

@apiServer.route('/ui/<path:path>')
def root(path):
    return send_from_directory('../../frontend/build/', path)

@apiServer.route('/client/<path:path>')
def clientTesting(path):
    return send_from_directory('../../client/', path)

@apiServer.route('/client/eventHandler/build/<file>')
def clientScript(file):
    response = make_response(send_file('../../client/eventHandler/build/' + file))
    response.headers['Content-Disposition'] = 'attachment; filename="client.js"'
    return response
