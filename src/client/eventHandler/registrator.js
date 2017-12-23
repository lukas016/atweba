import FactoryProcessors from './processors.js';

class EventRegistrator {
  constructor(eventsList) {
    this.factory = new FactoryProcessors();
    this.db = openDatabase('handler', '1.0', 'TestDB', 2048);
    this.recentlyLogged = {};
    this.factory.events.map(event => this.register(event));
  }
  register(event) {
    var processor = this.factory.getProcessor(event);
    if (processor == undefined) {
        console.error('Invalid processor');
        return;
    }

    document.addEventListener(event, function(e) {
        processor.run(e);
    });
  }
}

export default EventRegistrator;
