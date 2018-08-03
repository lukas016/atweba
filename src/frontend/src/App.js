/**
 * @file App.js
 * @author Lukas Koszegy
 * @brief Hlavny JSX element
 */

import React, { Component } from 'react';
import Header from './components/header';
//import RightBar from './components/right-bar';
import { CreateApp } from './components/form.js';
import { ToastContainer } from 'react-toastify';
import { ListApp } from './components/listApp.js';
import { ListScenario } from './components/listScenario.js';
import { ShowResult } from './components/showResult.js'
import { Tab } from 'semantic-ui-react'
import './css/main.css'
import { TimeGraph } from './components/timeGraph.js'

class App extends Component {
    constructor(props) {
        super(props);
        this.changeCreateApp = this.createAppChange.bind(this);
        this.showScenarios = this.changeScenarioId.bind(this);
        this.showComparator = this.addComparatorTab.bind(this)
        this.showTimeGraph = this.addTimeGraphTab.bind(this)
        this.bodyTitle = 'List of Applications'
        this.scenarioId = null
        this.state = {
            createScenario: false,
            bodyContent: ListApp,
            activeIndex: 0,
            panes: [
                {
                    menuItem: {key: 'apps', icon: 'browser', content: 'Applications'},
                    render: () => <Tab.Pane inverted><ListApp showScenarios={this.showScenarios} /></Tab.Pane>
                },
            ]
        }
    }

    // Zobrazenie formulara pre vytvorenie aplikacie
    createAppChange() {
        this.setState({
            createApp: !this.state.createApp
        });
    }

    // Zmena aktivnej zalozky
    handleTabChange = (e, { activeIndex }) => this.setState({ activeIndex })

    // Prepnutie na scenara
    changeScenarioId(id) {
        this.bodyTitle = `List of scenarios for ${id}`
        let tabs = [this.state.panes[0], this.generateScenarioTab(id)]
        this.setState({ panes: tabs, activeIndex: tabs.length - 1})
    }

    // Zobrazenie Grafu
    addTimeGraphTab = (appId, scenarioId) => {
        let tabs = this.state.panes.slice(0, 2)
            console.log(appId, scenarioId)
        tabs.push({
                menuItem: {key: 'timeGraph', icon: 'line graph', content: 'Time graph'},
                render: () => <Tab.Pane inverted><TimeGraph appId={appId} scenarioId={scenarioId} /></Tab.Pane>,
        })
        this.setState({ panes: tabs, activeIndex: tabs.length - 1 })
    }

    // Zobrazenie porovnava obrazkov
    addComparatorTab = (appId, scenarioId, scenarioName, testId, regressTestId) => {
        console.log(appId, scenarioId)
        let tabs = this.state.panes.slice(0, 2)
        tabs.push({
                menuItem: {'key': 'comparator', icon: 'copy', content: `Comparator for ${appId}:${scenarioName}`},
                render: () => <Tab.Pane inverted>
                                    <ShowResult appId={appId} scenarioId={scenarioId}
                                            testId={testId} regressTestId={regressTestId} />
                                </Tab.Pane>})
        this.setState({ panes: tabs, activeIndex: tabs.length - 1})
    }

    // Vygenerovanie zalozky so scenarmi pre aplikaciu
    generateScenarioTab(id) {
        return {
            menuItem: {'key': 'scenarios', icon: 'list', content: `Scenarios for ${id}`},
            render: () => <Tab.Pane inverted><ListScenario id={id} showComparator={this.showComparator} showTimeGraph={this.showTimeGraph} /></Tab.Pane>
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
