import React, { Component } from 'react';
import Header from './components/header';
//import RightBar from './components/right-bar';
import { CreateApp } from './components/form.js';
import { ToastContainer } from 'react-toastify';
import { ListApp } from './components/listApp.js';
import { ListScenario } from './components/listScenario.js';
import { Tab } from 'semantic-ui-react'
import './css/main.css'

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
            panes: [
                {
                    menuItem: { key: 'apps', icon: 'browser', content: 'Applications'},
                    render: () => <Tab.Pane inverted><ListApp showScenarios={this.showScenarios}/></Tab.Pane>
                },
            ]
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
        this.bodyTitle = `List of scenarios for ${id}`
        let tabes = [this.state.panes[0], this.generateScenarioTab(id)]
        this.setState({ panes: tabes })
    }

    generateScenarioTab(id) {
        return {
            menuItem: {'key': 'scenarios', icon: 'list', content: `Scenarios for ${id}`},
            render: () => <Tab.Pane inverted><ListScenario id={id} /></Tab.Pane>
        }
    }

    render() {
        let createApp = null;
        if (this.state.createApp)
            createApp = <CreateApp changeFormState={this.changeCreateApp}/>;

        return (
            <div className='main'>
                <Header createApp={this.changeCreateApp} />
                {createApp}
                <Tab panes={this.state.panes} />
                <ToastContainer autoclose={20000} />
            </div>
        );
    }
}

export default App;
