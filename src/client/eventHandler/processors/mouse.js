class processorMouse {
    get events() { return ["click", "move"] };
    parse() {
        let path = Array();
        for (let index = event.path.length-2; index >= 0; index--) {
            path.push(event.path[index].nodeName);
        }
        return {
            type: event.type,
            path: path,
            locator: OptimalSelect.select(event.target)
        }
    }
}

export default processorMouse;
