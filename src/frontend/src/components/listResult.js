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

const queries = {
    getResultAgg: gql`
        query getResultAgg($appId: ID!, $scenarioId: ID!) {
            getResultAgg(appId: $appId, scenarioId: $scenarioId) {
                testId
                events
            }
        }`,
}

class resultList extends Component {
    state = { apps: {}, rows: [] }

    disableLoading(id, operation) {
        let stateId = this.state.applications
        let index = stateId[id].indexOf(operation)
        stateId[id].splice(index, 1)
        this.setState({ applications: {...stateId} })
    }

    componentWillReceiveProps(newProps) {
        this.setState({rows: [...newProps.getResultAgg.getResultAgg]})
    }

    render() {
        const rows = this.props.getResultAgg.getResultAgg

        return(
            <ReactTable
                 defaultSorted={[{id: 'testId', asc: true}]}
                 data = {rows}
                 loading = {this.props.getResultAgg.loading}
                 columns = {[
                     {Header: 'Test id', accessor: 'testId'},
                    {Header: 'Count of Events', accessor: 'events'},
                 ]} />
        )
    }
};

export const
        ListResult = graphql(queries.getResultAgg, { name: 'getResultAgg',
                    options: (props) => ({ variables: { appId: props.appId, scenarioId: props.scenarioId }})}
                )(resultList);
