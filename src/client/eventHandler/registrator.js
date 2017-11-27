const processor = (event) => (
  console.log(event)
)

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
