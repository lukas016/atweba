/**
 * @file keyboard.js
 * @author Lukas Koszegy
 * @brief Testovaci procesor pre spracovanie stlacenia klavesnice (Nepouzity)
 **/

class processorKeyboard {
    get events() { return ["keypress"] };
    parse() {
        let path = Array();
        for (let index = event.path.length-2; index >= 0; index--) {
            path.push(event.path[index].nodeName);
        }
        return {
            type: event.type,
            path: path,
            locator: OptimalSelect.select(event.target),
            content: event.key
        }
    }
}

export default processorKeyboard;
