from server import app
import json
from flask import jsonify, request

@app.route('/api/version')
@app.route('/api/')
def apiVersion():
    return jsonify(version="0.1")

@app.route('/api/jobs', methods=['GET', 'POST'])
def routeJobs():
    if request.method == 'POST':
        app.logger.debug(request.values)
        return jsonify(request.files)
    if request.method == 'GET':
        return jsonify()
