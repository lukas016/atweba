import React, { Component } from 'react';
import { Button, Input, Loader, Popup } from 'semantic-ui-react';
import { compose, graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { toast } from 'react-toastify';
import '../css/list.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import '../css/react-table.css'
import { semanticFilter } from './simpleComponents.js'

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
        }`
}

class scenarioList extends Component {
    state = { apps: {} }

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
        app[name] = {name: value, timeout: setTimeout(this.saveName, 5000)}
        this.setState({apps: {...app}})
    }

    saveName = (e, x) => {
        this.props.getAllScenarios.startPolling(5000)
    }

    render() {
        let Rows = []
        if (!this.props.getAllScenarios.loading &&
                Array.isArray(this.props.getAllScenarios.scenario)) {
            Rows = this.props.getAllScenarios.scenario

            let app = this.state.apps
            Rows.map(({scenarioId, name}) => this.state.apps[scenarioId] ? '' : app[scenarioId] = {name: name})
            this.state.apps = app
        }
        return(
            <div style={{padding: '10px'}}>
            <Loader active={this.props.getAllScenarios.loading} inverted>
                Loading list of applications
            </Loader>
            <ReactTable filterable defaultSorted={[{id: 'uuid', desc: true}]}
                    data={Rows}
                    columns = {[
                            {Header: 'Name', accessor: 'name',
                                filterMethod: (filter, row) =>
                                    row[filter.id].startsWith(filter.value) &&
                                    row[filter.id].endsWith(filter.value),
                                Filter: semanticFilter,
                                Cell: ({original}) => <Input transparent focus
                                        value={this.state.apps[original.scenarioId].name ? this.state.apps[original.scenarioId].name : ''}
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
                            {Header: 'ID of Regress Test', accessor: 'regressTestId',
                                sortable: false, filterable: false, width: 180,
                                Cell: ({original}) => <div style={{textAlign: 'center'}}>{original.regressTestId}</div>
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
            </div>
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
