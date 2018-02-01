import FactoryProcessors from './factory-processors.js';
import Api from './api.js';

class EventRegistrator {
  constructor(eventsList) {
    this.factory = new FactoryProcessors();
    this.db = openDatabase('handler', '1.0', 'TestDB', 2048);
    this.recentlyLogged = {};
    this.factory.events.map(event => this.register(event));
    this.api = new Api();
  }

  register(event) {
    var processor = this.factory.getProcessor(event);

    if (processor == undefined) {
        console.error('Invalid processor');
        return;
    }

    document.addEventListener(event, function(e) {
        let msg = processor.parse(e);
        new Api(43).send(msg);
    });
  }
}

export default EventRegistrator;
