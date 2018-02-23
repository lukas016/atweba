class Api {
    constructor(id) {
        this.serverAddr = "http://127.0.0.1:5900";
        this.url = "/graphql";
        this.id = id;
        this.socket = new XMLHttpRequest();
        this.socket.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let response = JSON.parse(this.responseText);
                if ('errors' in response) {
                    alert('Client script: \n' + response.errors[0].message)
                }
           }
        };
    }

    send(msg) {
        this.socket.open("POST", this.serverAddr + this.url);
        this.socket.setRequestHeader("Content-Type", "application/json");
        msg.scenarioId = this.id;
        msg.url = window.location.href;
        let msgString = JSON.stringify(msg)
                .replace(/\"([^(\")"]+)\":/g,"$1:")
                .substr(1)
                .slice(0, -1);
        let msgForCreateEvent = { query: "mutation {createEvent(" + msgString + ") {ok}}",
                         variables: null,
                         operationName: null
                       }
        this.socket.send(JSON.stringify(msgForCreateEvent));

    }
}

export default Api;
