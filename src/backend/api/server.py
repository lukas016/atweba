from flask import Flask, send_from_directory

app = Flask(__name__)


@app.route('/ui/<path:path>')
def root(path):
    return send_from_directory('../../frontend/build/', path)
