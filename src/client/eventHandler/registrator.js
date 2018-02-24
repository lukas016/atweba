import FactoryProcessors from './factory-processors.js';
import Api from './api.js';

class EventRegistrator {
  constructor(eventsList) {
    this.factory = new FactoryProcessors();
    this.db = openDatabase('handler', '1.0', 'TestDB', 2048);
    this.recentlyLogged = {};
    this.factory.events.map(event => this.register(event));

    this.loadOptimalSelect();
  }

  register(event) {
    var processor = this.factory.getProcessor(event);

    if (processor == undefined) {
        console.error('Invalid processor');
        return;
    }

    document.addEventListener(event, function(e) {
        let msg = processor.parse(e);
        new Api('replace-with-scenario-id').send(msg);
    });
  }

  loadOptimalSelect() {
    let imported = document.createElement('script');
    imported.src = './eventHandler/optimal-select.min.js';
    document.head.appendChild(imported);
  }
}

var registrator = new EventRegistrator()

export { registrator };
