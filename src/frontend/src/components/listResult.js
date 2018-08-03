/**
 * @file listResult.js
 * @author Lukas Koszegy
 * @brief Zoznam vysledkov
 */

import React, { Component } from 'react';
import { Button, Checkbox, Icon, Popup } from 'semantic-ui-react';
import { compose, graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import '../css/list.css';
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import '../css/react-table.css'
import { ICON_STATE, COLOR_STATE, CLASS_STATE } from '../constants/state.js'

const queries = {
    getResultAgg: gql`
        query getResultAgg($appId: ID!, $scenarioId: ID!) {
            getResultAgg(appId: $appId, scenarioId: $scenarioId) {
                testId
                events
                regressTestId
                state
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

    // Zrusenie animacie nacitania
    disableLoading(id, operation) {
        let stateId = this.state.applications
        let index = stateId[id].indexOf(operation)
        stateId[id].splice(index, 1)
        this.setState({ applications: {...stateId} })
    }

    // ZMena regresneho testu pre dalsie testy
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
                 defaultSorted={[{id: 'testId', desc: true}]}
                 data = {rows}
                 loading = {this.props.getResultAgg.loading}
                 defaultPageSize = {10}
                 columns = {[
                     {Header: 'Regressive',
                         width: 125,
                         Cell: ({original}) =>
                            <Checkbox toggle checked={original.testId === this.state.regressTest ? true : false} onChange={() => this.setRegressTest(original.testId)} />,
                     },
                     {Header: 'Test id', accessor: 'testId',
                        Cell: ({original}) =>
                            <div style={{textAlign: 'center'}} >
                                {original.testId}
                            </div>},
                    {Header: 'Count of Events', accessor: 'events',
                        Cell: ({original}) =>
                            <div style={{textAlign: 'center'}} >
                                {original.events}
                            </div>
                    },
                    {Header: 'Regress Test', accessor: 'regressTestId',
                        Cell: ({original}) =>
                            <div style={{textAlign: 'center'}} >
                                {original.regressTestId}
                            </div>
                    },
                    {Header: 'State',
                        sortable: false,
                        Cell: ({ original }) => (<div style={{textAlign: 'center'}}>
                                <Icon name={ICON_STATE(original.state)} color={COLOR_STATE(original.state)} className={CLASS_STATE(original.state)}
                                circular inverted /></div>),
                        minWidth: 100, maxWidth: 200, width: 100},
                    {Header: 'Actions',
                        Cell: ({original}) =>
                            <Popup inverted
                                trigger={
                                    <Button icon='copy' circular onClick={() => this.props.showComparator(this.props.appId,
                                        this.props.scenarioId,
                                        this.props.scenarioName,
                                        original.testId,
                                        original.regressTestId)} />
                               }
                               content='Image differ' />
                    }
                 ]} />
        )
    }
};

export const
        ListResult = compose(
                withApollo,
                graphql(queries.getResultAgg, { name: 'getResultAgg',
                    options: (props) => ({ variables: { appId: props.appId, scenarioId: props.scenarioId },
                        pollInterval: 7300 })})
                )(resultList);
