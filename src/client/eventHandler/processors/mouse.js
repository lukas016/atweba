class processorMouse {
    get events() { return ["click", "move"] };
    run() {
        console.log(event);
        console.log(JSON.decycle(event));
        let xhttp = new XMLHttpRequest();
        xhttp.open("POST", "http://127.0.0.1:5900/api/jobs", true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify(event));
    }
}

export default processorMouse;
