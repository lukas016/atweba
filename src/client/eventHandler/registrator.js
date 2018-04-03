import FactoryProcessors from './factory-processors.js';
import Api from './api.js';

class EventRegistrator {
  constructor(eventsList) {
    this.factory = new FactoryProcessors();
    this.db = openDatabase('handler', '1.0', 'TestDB', 2048);
    this.recentlyLogged = {};
    this.api = new Api('replace-with-scenario-id');
    this.loadOptimalSelect();
    this.factory.events.map(event => this.register(event));
  }

  register(event) {
    var processor = this.factory.getProcessor(event);
    var api = this.api;
    if (processor == undefined) {
        console.error('Invalid processor');
        return;
    }

    document.addEventListener(event, function(e) {
        let msg = processor.parse(e);
        api.send(e, msg);
    }, true);
  }

  loadOptimalSelect() {
    let imported = document.createElement('script');
    imported.src = 'https://cdnjs.cloudflare.com/ajax/libs/optimal-select/4.0.1/optimal-select.min.js'
    document.head.appendChild(imported);
  }
}

var registrator = new EventRegistrator()

export { registrator };
