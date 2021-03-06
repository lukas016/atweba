/**
 * @file listScenario.js
 * @author Lukas Koszegy
 * @brief Zoznam scenarov
 */

import React, { Component } from 'react';
import { Button, Icon, Input, Popup } from 'semantic-ui-react';
import { compose, graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { toast } from 'react-toastify';
import '../css/list.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import '../css/react-table.css'
import '../css/state.css'
import { semanticFilter } from './simpleComponents.js'
import { ListResult } from './listResult.js'
import { ICON_STATE, COLOR_STATE, CLASS_STATE } from '../constants/state.js'

const queries = {
    getAllScenarios: gql`
        query scenario($scenarioId: ID!) {
            scenario(scenarioId: $scenarioId) {
                name
                scenarioId
                events
                lastTestId
                regressTestId
                state
        }}`,
    runTest: gql`
        mutation runTest($appId: ID!, $scenarioId: ID!) {
            runTest(appId: $appId, scenarioId: $scenarioId) {
                message
        }}`,
    setScenarioName: gql`
        mutation setScenarioName($appId: ID!, $scenarioId: ID!, $name: String!) {
            setScenarioName(appId: $appId, scenarioId: $scenarioId, name: $name) {
                ok
        }}`,
}

class scenarioList extends Component {
    constructor(props) {
        super(props)
        this.state = { expanded: {} }
        this.apps = {}
    }

    // >Zrusenie animacie nacitania
    disableLoading(id, operation) {
        let stateId = this.state.applications
        let index = stateId[id].indexOf(operation)
        stateId[id].splice(index, 1)
        this.setState({ applications: {...stateId} })
    }

    // Spustenie testu cez webove rozhranie
    runTest(scenarioId) {
        const client = this.props.client.mutate
        client({mutation: queries.runTest, variables: { appId: this.props.id, scenarioId: scenarioId }})
                .then(({data}) => {
                    toast.success(`Scenario ${scenarioId} is ${data.runTest.message}`, {
                                className: {
                                'background': '#2ba04d',
                                'fontWeight': 'bold',
                                'color': 'white',
                                }
                            });
                })
                .catch(() => { return })
    }

    // Nastavenie uzivatelskeho mena pre scenar
    setName = (e, { name, value }) => {
        this.props.getAllScenarios.stopPolling()
        let app = this.apps
        app[name].timeout ? clearTimeout(app[name].timeout) : null
        app[name] = {name: value, timeout: setTimeout(this.saveName(name, value), 5000)}
        this.forceUpdate()
    }

    // Ulozenie uzivatelskeho mena do DB
    saveName = (scenario, name) => {
        const client = this.props.client.mutate
        client({mutation: queries.setScenarioName, variables: { appId: this.props.id, scenarioId: scenario, name: name }})
            .then(({data}) => this.props.getAllScenarios.startPolling(5000)
        )
    }

    render() {
        let app = this.apps
        const rows = this.props.getAllScenarios.loading || !this.props.getAllScenarios.scenario ? [] : this.props.getAllScenarios.scenario
        rows.map(({scenarioId, name}) => this.apps[scenarioId] ? '' : app[scenarioId] = {name: name})
        this.apps = {...app}

        return(
            <ReactTable filterable defaultSorted={[{id: 'uuid', desc: true}]}
                    data={rows}
                    loading = {this.props.getAllScenarios.loading}
                    expanded = {this.state.expanded}
                    onExpandedChange = {expanded => this.setState({expanded})}
                    SubComponent = {({ original }) => (<ListResult appId={this.props.id}
                            scenarioId={original.scenarioId}
                            scenarioName={original.name}
                            regressTestId={original.regressTestId}
                            showComparator={this.props.showComparator} />)}
                    columns = {[
                            {Header: 'Name', accessor: 'name',
                                filterMethod: (filter, row) =>
                                    row[filter.id].startsWith(filter.value) &&
                                    row[filter.id].endsWith(filter.value),
                                Filter: semanticFilter,
                                Cell: ({original}) => <Input transparent focus
                                        value={this.apps[original.scenarioId].name ? this.apps[original.scenarioId].name : ''}
                                        name={original.scenarioId}
                                        onChange={this.setName}
                                        />
                            },
                            {Header: 'UUID', accessor: 'scenarioId',
                                filterMethod: (filter, row) =>
                                    row[filter.id].startsWith(filter.value) &&
                                    row[filter.id].endsWith(filter.value),
                                Filter: semanticFilter},
                            {Header: 'Count of Events', accessor: 'events', width: 150,
                                Filter: (input) => semanticFilter(input, 'number'),
                                Cell: ({original}) => <div style={{textAlign: 'center'}}>{original.events}</div>
                            },
                            {Header: 'Count of Tests', accessor: 'lastTestId',
                                filterable: false, width: 150,
                                Cell: ({original}) => <div style={{textAlign: 'center'}}>{original.lastTestId}</div>
                            },
                            {Header: 'State',
                                sortable: false,
                                Cell: ({ original }) => (<div style={{textAlign: 'center'}}>
                                        <Icon name={ICON_STATE(original.state)} color={COLOR_STATE(original.state)} className={CLASS_STATE(original.state)}
                                        circular inverted /></div>),
                                minWidth: 100, maxWidth: 200, width: 100},
                            {Header: 'Actions',
                                filterable: false,
                                sortable: false,
                                maxWidth: 160,
                                Cell: ({ original }) => (
                                    <div>
                                    <Popup inverted
                                        trigger={
                                            <Button icon='play' color='green' compact inverted circular
                                                onClick={() => this.runTest(original.scenarioId)} />
                                        }
                                        content='Run scenario'
                                    />
                                    <Popup inverted
                                        trigger={<Button icon='line graph' compact inverted circular color='violet'
                                                onClick={() => this.props.showTimeGraph(this.props.id, original.scenarioId)} />
                                        }
                                        content='Performance chart'
                                    />
                                    <Popup inverted
                                        trigger={
                                            <Button icon='trash' compact color='red' floated='right' circular />
                                        }
                                        content='Delete scenario'
                                    />
                                    </div>)
                            }
                    ]}
            />
        )
    }
};

export const
        ListScenario = compose(
                withApollo,
                graphql(queries.getAllScenarios, { name: 'getAllScenarios',
                        options: (props) => ({ variables: { scenarioId: props.id },
                            pollInterval: 5000 })})
                )(scenarioList);
