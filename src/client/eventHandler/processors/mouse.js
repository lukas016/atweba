class processorMouse {
    get events() { return ["click", "move", "mouseover"] };
    parse() {
        return {
            type: event.type,
        }
    }
}

export default processorMouse;
