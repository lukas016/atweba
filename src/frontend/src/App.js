import React, { Component } from 'react';
import Header from './components/header';
//import RightBar from './components/right-bar';
import { CreateApp } from './components/form.js';
import { ToastContainer } from 'react-toastify';
import { ListApp } from './components/listApp.js';
import { ListScenario } from './components/listScenario.js';

class App extends Component {
    constructor(props) {
        super(props);
        this.changeRightBar = this.rightBarChange.bind(this);
        this.changeCreateApp = this.createAppChange.bind(this);
        this.showScenarios = this.changeScenarioId.bind(this);
        this.bodyTitle = 'List of Applications'
        this.scenarioId = null
        this.state = {
            rightBar: false,
            createScenario: false,
            bodyContent: ListApp,
        }
    }

    rightBarChange() {
        this.setState({
            rightBar: !this.state.rightBar
        });
    }

    createAppChange() {
        this.setState({
            createApp: !this.state.createApp
        });
    }

    changeScenarioId(id) {
        this.scenarioId = id
        this.changeBody(ListScenario)
    }

    changeBody(name) {
        this.setState({
            bodyContent: name
        })
    }

    getBody() {
        switch (this.state.bodyContent) {
            case ListApp:
            default:
                this.bodyTitle = 'List of Applications'
                return <ListApp showScenarios={this.showScenarios}/>
            case ListScenario:
                this.bodyTitle = 'List of scenarios for ' + this.scenarioId
                return <ListScenario id={this.scenarioId} />
        }
    }

    render() {
        let createApp = null;
        if (this.state.createApp)
            createApp = <CreateApp changeFormState={this.changeCreateApp}/>;

        let body = this.getBody();

        return (
            <div className='main'>
                <Header rightBar={this.changeRightBar} createApp={this.changeCreateApp} title={this.bodyTitle}/>
                {createApp}
                <div className='body'>
                    {body}
                </div>
                <ToastContainer autoclose={20000} />
            </div>
        );
    }
}

export default App;
