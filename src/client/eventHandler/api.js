class Api {
    constructor(id) {
        this.serverAddr = "http://127.0.0.1:5900";
        this.url = "/graphql";
        this.id = id;
        this.socket = new XMLHttpRequest();

    }

    send(msg) {
        this.socket.open("POST", this.serverAddr + this.url);
        this.socket.setRequestHeader("Content-Type", "application/json");
        msg.scenarioId = this.id;
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
