class processorMouse {
    get events() { return ["click", "move"] };
    parse() {
        return {
            type: event.type,
        }
    }
}

export default processorMouse;
