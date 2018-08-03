/**
 * @file factory-processors.js
 * @author Lukas Koszegy
 * @brief Centralna sprava procesorov
 **/

import processorMouse from './processors/mouse.js';
//import processorKeyboard from './processors/keyboard.js';
import processorInput from './processors/input.js';

// Definovanie procesorov
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

    // Dostanie procesoru na zaklade typu udalosti
    getProcessor(event) {
        for (let index in this.processors)
            if (this.processors[index].events.includes(event))
                return this.processors[index];

        return undefined;
    }

    // Nacitanie procesorov do internych struktur
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
