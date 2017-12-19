from server import app
import json
from flask import jsonify

@app.route('/api/version')
def apiVersion():
    return jsonify(version="0.1")
