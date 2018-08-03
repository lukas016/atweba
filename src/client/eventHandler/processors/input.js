/**
 * @file input.js
 * @author Lukas Koszegy
 * @brief Procesor pre spracovanie formularov
 **/

class processorInput {
    get events() { return ["focusout"] };
    parse() {
        if (event.target.type == "button" || event.target.type == "submit") {
            return;
        }
        return {
            type: event.type,
            content: event.target.value
        }
    }
}

export default processorInput;
