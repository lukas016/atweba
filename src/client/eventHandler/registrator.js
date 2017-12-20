const processor = (event) => {
  console.log(event);
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "http://127.0.0.1:5900/api/jobs", true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify(event));
}

const DOM_EVENTS = [
    [MouseEvent, ["click", "move"]],
    [KeyboardEvent, ["keypress"]],
]

class EventRegistrator {
  constructor(eventsList) {
    this.db = openDatabase('handler', '1.0', 'TestDB', 2048);
    this.recentlyLogged = {};
    eventsList.map(element => element[1].map(event => this.register(event)));
  }
  register(event) {
    document.addEventListener(event, function(e) {
      processor(e);
    });
  }
}
