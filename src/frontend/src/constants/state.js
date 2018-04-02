const groupStates = new Object({result: {init: 0, values: ['OK', 'COUNT_EVENTS', 'FAILED']},
        state: {init: 100, values:['INITIALIZE', 'TESTING', 'ANALYZE']}})

const generateState = () => {
    let result = {}
    for (let key in groupStates) {
        let index = groupStates[key].init
        for (let item in groupStates[key].values) {
            result[index++] = 'state' + groupStates[key].values[item]
        }
    }

    return result
}

const STATE = (code) => {
    const states = generateState()
    if (code in states)
        return states[code]

    return 'invalidState'
}

export { STATE }
