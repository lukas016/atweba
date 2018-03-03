class Api {
    constructor(appId) {
        this.serverAddr = "http://127.0.0.1:5900"
        this.url = "/graphql"
        this.disabled = false
        this.appId = appId
        this.uuid = require('uuid/v4')
        this.scenarioId = function() { return localStorage.getItem('scenarioId') }
        this.socket = new XMLHttpRequest()
        this.socket.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let response = JSON.parse(this.responseText);
                if ('errors' in response) {
                    alert('Client script: \n' + response.errors[0].message)
                }
           }
        };
        this.initScenarioId();
    }

    initScenarioId() {
        if (typeof(Storage) == 'undefined') {
            alert('Missing local storage. Script need local storage for correct working.')
            return
        }

        if (!this.scenarioId()) {
            localStorage.setItem('scenarioId', this.uuid())
        }

        var obj = this
        document.addEventListener('keydown', function(e) { obj.endLogging(e, obj) })
    }

    endLogging(e, obj) {
        var evtobj = window.event ? event : e
        if (evtobj.keyCode == 90 && evtobj.ctrlKey) {
            localStorage.removeItem('scenarioId')
            obj.uuid = function() { return null }
            obj.disabled = true
            alert('Record of test was ended')
        }
    }

    send(msg) {
        if (this.disabled) return
        this.socket.open("POST", this.serverAddr + this.url)
        this.socket.setRequestHeader("Content-Type", "application/json")
        msg.appId = this.appId
        msg.scenarioId = this.scenarioId()
        msg.url = window.location.href
        let msgString = JSON.stringify(msg)
                .replace(/\"([^(\")"]+)\":/g,"$1:")
                .substr(1)
                .slice(0, -1)
        let msgForCreateEvent = { query: "mutation {createEvent(" + msgString + ") {ok}}",
                         variables: null,
                         operationName: null
                       }
        this.socket.send(JSON.stringify(msgForCreateEvent))

    }
}

export default Api;
