import processorMouse from './processors/mouse.js';
//import processorKeyboard from './processors/keyboard.js';
import processorInput from './processors/input.js';

const PROCESSORS =
[
    processorMouse,
    processorInput
];

class FactoryProcessors {
    constructor() {
        this.processors = [];
        this.events = [];
        this.registerProcessor();
    }

    getProcessor(event) {
        for (let index in this.processors)
            if (this.processors[index].events.includes(event))
                return this.processors[index];

        return undefined;
    }

    registerProcessor() {
        var events = [];
        PROCESSORS.map(element => {
            var processor = new element();
            this.processors.push(processor);
            events = events.concat(processor.events);
        });
        this.events = Array.from(new Set(events));
    }
}

export default FactoryProcessors;
