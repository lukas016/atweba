import React, { Component } from 'react';
import { Button, Checkbox, Input, Popup } from 'semantic-ui-react';
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
    setRegressTest: gql`
        mutation setRegressTest($appId: ID!, $scenarioId: ID!, $testId: Int!) {
            setRegressTest(appId: $appId, scenarioId: $scenarioId, testId: $testId) {
                status
            }
        }`,
}

class resultList extends Component {
    constructor(props) {
        super(props)
        this.state = { apps: {}, rows: [], regressTest: props.regressTestId }
    }

    disableLoading(id, operation) {
        let stateId = this.state.applications
        let index = stateId[id].indexOf(operation)
        stateId[id].splice(index, 1)
        this.setState({ applications: {...stateId} })
    }

    setRegressTest = (testId) => {
        const client = this.props.client.mutate
        client({mutation: queries.setRegressTest,
            variables: { appId: this.props.appId, scenarioId: this.props.scenarioId, testId: testId }})
            .then(({data}) => {
                if (data.setRegressTest.status === true) {
                    this.setState({regressTest: testId})
                }
            })
    }

    render() {
        const rows = this.props.getResultAgg.getResultAgg

        return(
            <ReactTable
                 defaultSorted={[{id: 'testId', asc: true}]}
                 data = {rows}
                 loading = {this.props.getResultAgg.loading}
                 pageSize = {10}
                 columns = {[
                     {
                         width: 75,
                         Cell: ({original}) =>
                            <Checkbox toggle checked={original.testId === this.state.regressTest ? true : false} onChange={() => this.setRegressTest(original.testId)} />,
                     },
                     {Header: 'Test id', accessor: 'testId',
                        Cell: ({original}) =>
                            <div style={{textAlign: 'center'}} className={original.testId === this.state.regressTest ? 'regressTest' : ''}>
                                {original.testId}
                            </div>},
                    {Header: 'Count of Events', accessor: 'events',
                        Cell: ({original}) =>
                            <div style={{textAlign: 'center'}} className={original.testId === this.state.regressTest ? 'regressTest' : ''}>
                                {original.events}
                            </div>
                    },
                 ]} />
        )
    }
};

export const
        ListResult = compose(
                withApollo,
                graphql(queries.getResultAgg, { name: 'getResultAgg',
                    options: (props) => ({ variables: { appId: props.appId, scenarioId: props.scenarioId }})})
                )(resultList);
