#!/usr/bin/python3.6

from flask import Flask, send_from_directory
from environment import Environment

app = Flask(__name__)

def setConfiguration(environment):
    app.config.update(
        DEBUG=True,
        LOGGER_NAME='server',
    )

    if environment == Environment.TESTING.name:
        app.config['TESTING'] = True

    if environment == Environment.PRODUCTION.name:
        app.config.update(DEBUG=False)


@app.route('/ui/<path:path>')
def root(path):
    return send_from_directory('../../frontend/build/', path)

if __name__ == '__main__':
    setConfiguration('DEVEL')
    app.run(port=5900)
