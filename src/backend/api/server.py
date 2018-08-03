##
# @file server.py
# @author Lukas Koszegy
# @brief Inicializacia API a nastavenie URL
##

from flask import Flask, send_from_directory, make_response, send_file
from flask_graphql import GraphQLView
from .schema import schema
from zeromq import ZeroClient
from os import getcwd

# Instancia
apiServer = Flask(__name__)

#GraphQL
apiServer.add_url_rule('/graphqlTesting',
        view_func=GraphQLView.as_view('graphqlTesting',
            schema=schema, graphiql=True, context={'aggClient': ZeroClient('apiServer')}))

# Screenshoty z testov
@apiServer.route('/screenshot/<path:path>')
def screenshotResult(path):
    return send_from_directory('../screenshot/', path)

# Generovane klientske skripty
@apiServer.route('/client/<file>')
def clientScript(file):
    response = make_response(send_file('../client/' + file))
    response.headers['Content-Disposition'] = 'attachment; filename="client.js"'
    return response

# Smerom dole len Subory weboveho rozhrania (Nepovinne)
@apiServer.route('/static/css/<file>')
def cssContent(file):
    return send_file('../../frontend/build/static/css/' + file)

@apiServer.route('/static/js/<file>')
def jsContent(file):
    return send_file('../../frontend/build/static/js/' + file)

@apiServer.route('/static/media/<file>')
def mediaContent(file):
    return send_file('../../frontend/build/static/media/' + file)

@apiServer.route('/', defaults={'path': 'index.html'})
@apiServer.route('/<path>')
def root(path):
    return send_file('../../frontend/build/' + path)
