const groupStates = new Object({result: {init: 0, values: ['OK', 'COUNT_EVENTS', 'FAILED']},
        state: {init: 100, values:['INITIALIZE', 'TESTING', 'ANALYZE']}})

const generateState = () => {
    let result = {}
    for (let key in groupStates) {
        let index = groupStates[key].init
        for (let item in groupStates[key].values)
            result[index++] = groupStates[key].values[item]
    }

    return result
}

const STATE = (code) => {
    const states = generateState()
    if (code in states)
        return states[code]

    return 'INVALID'
}

const ICON_STATE = (code) => {
    console.log(STATE(code))
    switch (STATE(code)) {
        case 'OK':
            return 'checkmark'
        case 'COUNT_EVENTS':
            return 'ban'
        case 'FAILED':
            return 'warning circle'
        case 'INITIALIZE':
            return 'settings'
        case 'TESTING':
            return 'spinner'
        case 'ANALYZE':
            return 'image'
        default:
            return 'help circle'
    }
}

const CLASS_STATE = (code) => {
    return `state${STATE(code)}`
}


const COLOR_STATE = (code) => {
    switch (STATE(code)) {
        case 'OK':
            return 'green'
        case 'COUNT_EVENTS':
            return 'yellow'
        case 'FAILED':
            return 'red'
        case 'INITIALIZE':
        case 'TESTING':
        case 'ANALYZE':
            return 'blue'
        default:
            return 'grey'
    }
}
export { STATE, ICON_STATE, COLOR_STATE, CLASS_STATE }
