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
        this.changeCreateApp = this.createAppChange.bind(this);
        this.showScenarios = this.changeScenarioId.bind(this);
        this.bodyTitle = 'List of Applications'
        this.scenarioId = null
        this.state = {
            createScenario: false,
            bodyContent: ListApp,
            activeIndex: 0,
            panes: [
                {
                    menuItem: {key: 'apps', icon: 'browser', content: 'Applications'},
                    render: () => <Tab.Pane inverted><ListApp showScenarios={this.showScenarios}/></Tab.Pane>
                },
            ]
        }
    }

    createAppChange() {
        this.setState({
            createApp: !this.state.createApp
        });
    }

    handleTabChange = (e, { activeIndex }) => this.setState({ activeIndex })

    changeScenarioId(id) {
        this.bodyTitle = `List of scenarios for ${id}`
        let tabs = [this.state.panes[0], this.generateScenarioTab(id)]
        this.setState({ panes: tabs, activeIndex: tabs.length - 1})
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
                <Tab panes={this.state.panes} activeIndex={this.state.activeIndex} onTabChange={this.handleTabChange} className='body'/>
                <ToastContainer autoclose={20000} />
            </div>
        );
    }
}

export default App;
