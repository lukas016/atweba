import React, { Component } from 'react';
import Header from './components/header';
//import RightBar from './components/right-bar';
import { CreateScenario } from './components/form.js';

class App extends Component {
    constructor(props) {
        super(props);
        this.changeRightBar = this.rightBarChange.bind(this);
        this.changeCreateScenario = this.createScenarioChange.bind(this);
        this.state = {
            rightBar: false,
            createScenario: false
        }
    }

    rightBarChange() {
        this.setState({
            rightBar: !this.state.rightBar
        });
    }

    createScenarioChange() {
        this.setState({
            createScenario: !this.state.createScenario
        });
    }

    render() {
        let createScenario = null;
        if (this.state.createScenario)
            createScenario = <CreateScenario />;
        console.log(createScenario)
        return (
            <div className='main'>
                <Header rightBar={this.changeRightBar} createScenario={this.changeCreateScenario} />
                {createScenario}
            </div>
        );
    }
}

export default App;
