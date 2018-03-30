import React, { Component } from 'react';
import { Button, Input, Popup } from 'semantic-ui-react';
import { compose, graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { toast } from 'react-toastify';
import '../css/list.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import '../css/react-table.css'
import { semanticFilter } from './simpleComponents.js'
import { ListResult } from './listResult.js'

const queries = {
    getAllScenarios: gql`
        query scenario($scenarioId: ID!) {
            scenario(scenarioId: $scenarioId) {
                name
                scenarioId
                events
                lastTestId
                regressTestId
        }}`,
    runTest: gql`
        query runTest($appId: ID!, $scenarioId: ID!) {
            runTest(appId: $appId, scenarioId: $scenarioId)
        }`,
    setScenarioName: gql`
        mutation setScenarioName($appId: ID!, $scenarioId: ID!, $name: String!) {
            setScenarioName(appId: $appId, scenarioId: $scenarioId, name: $name) {
                ok
        }}`,
}

class scenarioList extends Component {
    constructor(props) {
        super(props)
        this.state = { apps: {}, rows: [], expanded: {} }
    }

    disableLoading(id, operation) {
        let stateId = this.state.applications
        let index = stateId[id].indexOf(operation)
        stateId[id].splice(index, 1)
        this.setState({ applications: {...stateId} })
    }


    runTest(scenarioId) {
        const client = this.props.client.query
        console.log(scenarioId)
        client({query: queries.runTest, variables: { appId: this.props.id, scenarioId: scenarioId }})
                .then(({data}) => {
                    toast.success(`Scenario ${scenarioId} \nis running`, {
                                className: {
                                'background': '#2ba04d',
                                'fontWeight': 'bold',
                                'color': 'white',
                                }
                            });
                })
                .catch(() => { return })
    }

    setName = (e, { name, value }) => {
        this.props.getAllScenarios.stopPolling()
        let app = this.state.apps
        app[name].timeout ? clearTimeout(app[name].timeout) : null
        app[name] = {name: value, timeout: setTimeout(this.saveName(name, value), 5000)}
        this.setState({apps: {...app}})
    }

    saveName = (scenario, name) => {
        const client = this.props.client.mutate
        client({mutation: queries.setScenarioName, variables: { appId: this.props.id, scenarioId: scenario, name: name }})
        this.props.getAllScenarios.startPolling(5000)
    }

    componentWillReceiveProps(newProps){
        let app = this.state.apps
        console.log("TU")
        const Rows = newProps.getAllScenarios.scenario
        Rows.map(({scenarioId, name}) => this.state.apps[scenarioId] ? '' : app[scenarioId] = {name: name})
        this.apps = app
        this.setState({rows: [...newProps.getAllScenarios.scenario]})
    }

    render() {
        let app = []
        let rows = this.props.getAllScenarios.loading ? [] : this.props.getAllScenarios.scenario
        rows.map(({scenarioId, name}) =>  app[scenarioId] = {name: name})
        this.apps = app

        return(
            <ReactTable filterable defaultSorted={[{id: 'uuid', desc: true}]}
                    data={rows}
                    loading = {this.props.getAllScenarios.loading}
                    expanded = {this.state.expanded}
                    onExpandedChange = {expanded => this.setState({expanded})}
                    SubComponent = {({ original }) => (<ListResult appId={this.props.id} scenarioId={original.scenarioId} regressTestId={original.regressTestId} />)}
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
                            {Header: 'Actions',
                                filterable: false,
                                sortable: false,
                                maxWidth: 160,
                                Cell: row => (
                                    <div>
                                    <Popup inverted
                                        trigger={
                                            <Button icon='play' color='green' compact inverted circular
                                                onClick={() => this.runTest(row.original.scenarioId)}>
                                            </Button>}
                                        content='Run scenario'
                                    />
                                    <Popup inverted
                                        trigger={
                                            <Button icon='file text' compact inverted circular color='violet'>
                                            </Button>}
                                        content='Tests'
                                    />
                                    <Popup inverted
                                        trigger={
                                            <Button icon='delete' compact color='red' floated='right' circular>
                                            </Button>}
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
