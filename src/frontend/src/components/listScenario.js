import React, { Component } from 'react';
import { Button, Loader, Popup } from 'semantic-ui-react';
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
                scenarioId
                events
        }}`,
    runTest: gql`
        query runTest($appId: ID!, $scenarioId: ID!) {
            runTest(appId: $appId, scenarioId: $scenarioId)
        }`
}

class scenarioList extends Component {
    state = { }

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

    render() {
        let Rows = []
        if (!this.props.getAllScenarios.loading &&
                Array.isArray(this.props.getAllScenarios.scenario))
            Rows = this.props.getAllScenarios.scenario

        return(
            <div style={{padding: '10px'}}>
            <Loader active={this.props.getAllScenarios.loading} inverted>
                Loading list of applications
            </Loader>
            <ReactTable filterable defaultSorted={[{id: 'uuid', desc: true}]}
                    data={Rows}
                    columns = {[
                            {Header: 'UUID', accessor: 'scenarioId',
                                filterMethod: (filter, row) =>
                                    row[filter.id].startsWith(filter.value) &&
                                    row[filter.id].endsWith(filter.value),
                                Filter: semanticFilter},
                            {Header: 'Count of Events', accessor: 'events',
                                Filter: (input) => semanticFilter(input, 'number')},
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
