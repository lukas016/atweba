import React, { Component } from 'react';
import ReactTable from 'react-table'
import gql from 'graphql-tag';
import { compose, graphql, withApollo } from 'react-apollo';
import { semanticFilter } from './simpleComponents.js'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Checkbox } from 'semantic-ui-react';
import '../css/react-table.css'
import '../css/graph.css'

const queries = {
    getResult: gql`
        query getResult($appId: ID!, $scenarioId: ID!, $testId: [Int!]) {
            getResult(appId: $appId, scenarioId: $scenarioId, testId: $testId) {
                id
                performTime
            }
        }`,
    getResultAgg: gql`
        query getResultAgg($appId: ID!, $scenarioId: ID!) {
            getResultAgg(appId: $appId, scenarioId: $scenarioId) {
                testId
                events
                regressTestId
                state
            }
        }`,
}

class timeGraph extends Component {
    constructor(props) {
        super(props)
        this.state = {active: null}
        this.state = { graph: [], lines: [] }
    }

    showTest = (testId) => {
        const client = this.props.client.query
        if ( !this.existData(testId) )
            client({query: queries.getResult,
                variables: { appId: this.props.appId, scenarioId: this.props.scenarioId, testId: testId }})
                .then(({ data }) => this.updateGraph(testId, data.getResult))
        else
            this.updateGraph(testId)
    }

    existData = (testId) => !this.state.graph && Object.keys(this.state.graph[0].forEach(function(key, index) {
            if (key === testId)
                return true
        }))

    updateGraph = (testId, results = []) => {
        let { graph, lines } = this.state

        if (!this.existData(testId))
            for(let i = 0, length = graph.length; i < results.length; i++) {
                if (length === 0)
                    graph.push({name: results[i].id})

                graph[i][testId] = results[i].performTime
            }

        const index = lines.indexOf(lines.find(x => x.key === String(testId)))
        if (index !== -1)
            lines.splice(index, 1)
        else
            lines.push(<Line type="monotone" key={testId} dataKey={testId} stroke={'#'+(Math.random()*0xFFFFFF<<0).toString(16)} />)

        this.setState({graph: [...graph], lines: [...lines]})
    }

    generateGraph = () => {
        const { graph, lines } = this.state
        if (graph.length === 0)
            return null

        return (<ResponsiveContainer>
            <LineChart data={this.state.graph}
                margin={{top: 35, right: 30, left: 20, bottom: 100}}>
                <XAxis dataKey='name'/>
                <YAxis type='number' unit='ms'/>
                <Legend/>
                <Tooltip/>
                {lines}
            </LineChart>
            </ResponsiveContainer>)
    }
    render() {
        let rows = []
        if (!this.props.getResultAgg.loading)
            rows = this.props.getResultAgg.getResultAgg

        let graph = this.generateGraph()
        return(
            <div className='showGraph'>
                <div className='testList'>
                    <ReactTable filterable defaultSorted={[{id: 'testId', desc: true}]}
                    data={rows}
                    loading = {this.props.getResultAgg.loading}
                    pageSize = {20}
                    columns = {[
                            {Header: 'Test', accessor: 'testId', width: 120,
                                Filter: (input) => semanticFilter(input, 'number'),
                                Cell: ({ original }) => <div style={{textAlign: 'center'}}>
                                    {original.testId}
                                </div>,
                            },
                            {
                                filterable: false,
                                width: 60,
                                Cell: ({ original }) => (<Checkbox toggle onChange={() => this.showTest(original.testId)} />)
                            },
                    ]} />
                </div>
                <div className='graphWrapper'>
                    {graph}
                </div>
            </div>
        )
    }
};

export const TimeGraph = compose(
            withApollo,
            graphql(queries.getResultAgg, { name: 'getResultAgg',
                options: (props) => ({ variables: { appId: props.appId, scenarioId: props.scenarioId }})}),
        )(timeGraph)
