#!/usr/bin/python3.6

from api import *
from server import app
from environment import Environment

def setConfiguration(environment):
    app.config.update(
        DEBUG=True,
        LOGGER_NAME='server',
    )

    if environment == Environment.TESTING.name:
        app.config['TESTING'] = True

    if environment == Environment.PRODUCTION.name:
        app.config.update(DEBUG=False)

if __name__ == '__main__':
    setConfiguration('DEVEL')
    app.run(port=5900)
