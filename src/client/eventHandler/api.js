class Api {
    constructor(appId) {
        this.url = "/graphqlTesting"
        this.disabled = false
        this.appId = appId
        this.uuid = require('uuid/v4')
        this.scenarioId = function() { return sessionStorage.getItem('scenarioId') }
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

        if (!this.scenarioId())
            sessionStorage.setItem('scenarioId', this.uuid().split('-').join(''))

        var obj = this
        document.addEventListener('keydown', function(e) { obj.endLogging(e, obj) })
    }

    endLogging(e, obj) {
        var evtobj = window.event ? event : e
        if (evtobj.keyCode == 90 && evtobj.ctrlKey) {
            sessionStorage.removeItem('scenarioId')
            obj.uuid = function() { return null }
            obj.disabled = true
            alert('Record of test was ended')
        }
    }

    generatePath(event) {
        let path = Array()
        for (let index = event.path.length-2; index >= 0; index--)
            path.push(event.path[index].nodeName)

        return path
    }

    setGeneralInfo(event, msg) {
        msg.appId = this.appId
        msg.scenarioId = this.scenarioId()
        msg.timestamp = new Date().getTime() / 1000
        msg.url = window.location.href
        msg.screenX = event.screenX
        msg.screenY = event.screenY
        msg.pageTime = event.timeStamp
        msg.path = this.generatePath(event)
        msg.locator = OptimalSelect.select(event.target)
    }

    send(event, msg) {
        if (this.disabled || !'type' in msg) return
        this.setGeneralInfo(event, msg)
        console.log(msg)
        this.socket.open("POST", this.url)
        this.socket.setRequestHeader("Content-Type", "application/json")
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
