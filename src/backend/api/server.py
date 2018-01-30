from flask import Flask, send_from_directory

from flask_graphql import GraphQLView
from schema import schema

app = Flask(__name__)

#GraphQL
app.add_url_rule('/graphql', view_func=GraphQLView.as_view('graphql', schema=schema, graphiql=True))

@app.route('/ui/<path:path>')
def root(path):
    return send_from_directory('../../frontend/build/', path)

@app.route('/client/<path:path>')
def clientTesting(path):
    return send_from_directory('../../client/', path)
