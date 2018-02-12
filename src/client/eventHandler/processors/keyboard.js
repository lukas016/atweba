class processorKeyboard {
    get events() { return ["keypress"] };
    parse() {
        let path = Array();
        console.log(event)
        for (let index = event.path.length-2; index >= 0; index--) {
            path.push(event.path[index].nodeName);
        }
        return {
            type: event.type,
            timestamp: event.timeStamp,
            path: path,
            locator: OptimalSelect.select(event.target),
            content: event.key
        }
    }
}

export default processorKeyboard;
