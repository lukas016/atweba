/**
 * @file timeGraph.js
 * @author Lukas Koszegy
 * @brief Implementacia komponenty Graf
 */

import React, { Component } from 'react';
import ReactTable from 'react-table'
import gql from 'graphql-tag';
import { compose, graphql, withApollo } from 'react-apollo';
import { semanticFilter } from './simpleComponents.js'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Checkbox } from 'semantic-ui-react';
import '../css/react-table.css'
import '../css/graph.css'
import tinycolor from 'tinycolor2'

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
    getTest: gql`
        query getTest($appId: ID!, $scenarioId: ID!) {
            getTest(appId: $appId, scenarioId: $scenarioId) {
                locator
                type
            }
        }`,
}

class timeGraph extends Component {
    constructor(props) {
        super(props)
        this.state = {active: null}
        this.state = { graph: [], lines: [] }
    }

    // Zobrazenie testu v grafe
    showTest = (testId) => {
        const client = this.props.client.query
        if ( !this.existData(testId) ) {
            // Nacitanie vysledkov zo servera
            client({query: queries.getResult,
                variables: { appId: this.props.appId, scenarioId: this.props.scenarioId, testId: testId }})
                .then(({ data }) => this.updateGraph(testId, data.getResult))
        }
        else {
            this.updateGraph(testId)
        }
    }

    // Kontrola ci bol test uz raz nacitany
    existData = (testId) => !this.state.graph && Object.keys(this.state.graph[0].forEach(function(key, index) {
            if (key === testId)
                return true
        }))

    // Generovanie len svetlych farieb
    generateColor = () => {
        let color

        do {
            color = tinycolor('#'+(Math.random()*0xFFFFFF<<0).toString(16))
        } while(color.isDark())
        console.log(color.getOriginalInput())

        return color.getOriginalInput()
    }

    // Generovanie udajov o grafe
    updateGraph = (testId, results = []) => {
        let { graph, lines } = this.state
        const events = this.props.getTest.getTest

        console.log(events.length)
        if (graph.length === 0)
            for (let i = 0; i < events.length; i++)
                graph.push({name: `${events[i].type}: ${events[i].locator}`})

        console.log(graph.length)

        if (!this.existData(testId))
            for(let i = 0; i < results.length; i++)
                graph[i][testId] = parseFloat(results[i].performTime.toFixed(3))

        const index = lines.indexOf(lines.find(x => x.key === String(testId)))
        if (index !== -1)
            lines.splice(index, 1)
        else
            lines.push(<Line type="monotone" key={testId} dataKey={testId} stroke={this.generateColor()} />)

        this.setState({graph: [...graph], lines: [...lines]})
    }

    // Generovanie JSX elementu s Grafom
    generateGraph = () => {
        const { graph, lines } = this.state
        if (graph.length === 0 || this.props.getTest.getTest.length === 0)
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
                    defaultPageSize = {20}
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
            graphql(queries.getTest, { name: 'getTest',
                options: (props) => ({ variables: { appId: props.appId, scenarioId: props.scenarioId }})}),
        )(timeGraph)
