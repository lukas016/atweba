from flask import Flask, send_from_directory, make_response, send_file
from flask_autoindex import AutoIndex
from flask_graphql import GraphQLView
from .schema import schema
from zeromq import ZeroClient
from os import getcwd
apiServer = Flask(__name__)
#AutoIndex(apiServer, getcwd() + '/screenshot')
#GraphQL
apiServer.add_url_rule('/graphqlTesting',
        view_func=GraphQLView.as_view('graphqlTesting',
            schema=schema, graphiql=True, context={'aggClient': ZeroClient('apiServer')}))

@apiServer.route('/ui/<path:path>')
def root(path):
    return send_from_directory('../../frontend/build/', path)

@apiServer.route('/screenshot/<path:path>')
def screenshotResult(path):
    return send_from_directory('../screenshot/', path)

@apiServer.route('/client/<file>')
def clientScript(file):
    response = make_response(send_file('../client/' + file))
    response.headers['Content-Disposition'] = 'attachment; filename="client.js"'
    return response
