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
        msg.id = this.id;
        let msgForServer = { query: msg,
                         variables: null,
                         operationName: null
                       }
        this.socket.send(JSON.stringify(msgForServer));
    }
}

export default Api;
