class processorInput {
    get events() { return ["focusout"] };
    parse() {
        let path = Array();
        for (let index = event.path.length-2; index >= 0; index--) {
            path.push(event.path[index].nodeName);
        }
        if (event.target.type == "button" || event.target.type == "submit") {
            return;
        }
        return {
            type: event.type,
            path: path,
            locator: OptimalSelect.select(event.target),
            content: event.target.value
        }
    }
}

export default processorInput;
