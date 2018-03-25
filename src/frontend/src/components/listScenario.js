import React, { Component } from 'react';
import { Loader } from 'semantic-ui-react';
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
        }}`
}

class scenarioList extends Component {
    state = { }

    disableLoading(id, operation) {
        let stateId = this.state.applications
        let index = stateId[id].indexOf(operation)
        stateId[id].splice(index, 1)
        this.setState({ applications: {...stateId} })
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
                                Filter: (input) => semanticFilter(input, 'number')}
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
