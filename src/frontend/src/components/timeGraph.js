import React, { Component } from 'react';
import { Checkbox } from 'semantic-ui-react';
import { compose, graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import ReactTable from 'react-table'
import '../css/react-table.css'
import { LineChart, Line, XAxis, YAxis, Legend } from 'recharts'

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

const test = [
      {name: 'Page A', uv: 4000, pv: 2400, amt: 2400},
      {name: 'Page B', uv: 3000, pv: 1398, amt: 2210},
      {name: 'Page C', uv: 2000, pv: 9800, amt: 2290},
      {name: 'Page D', uv: 2780, pv: 3908, amt: 2000},
      {name: 'Page E', uv: 1890, pv: 4800, amt: 2181},
      {name: 'Page F', uv: 2390, pv: 3800, amt: 2500},
      {name: 'Page G', uv: 3490, pv: 4300, amt: 2100},
];

class timeGraph extends Component {
    constructor(props) {
        super(props)
        this.state = {active: null}
        this.data = {}
        this.graph = []
    }

    showTest = (testId) => {
        if (testId in this.data) {
            this.graph.push(this.data[testId])
            this.forceUpdate()
            return
        }

        const client = this.props.client.query
        client({query: queries.getResult,
            variables: { appId: this.props.appId, scenarioId: this.props.scenarioId, testId: testId }})
            .then(({data}) => {
                const results = data.getResult
                this.data[testId] = results
                console.log(results)
                for(let i = 0, length = this.graph.length; i < data.getResult.length; i++) {
                    if (length === 0) {
                        this.graph.push({name: results[i].id})
                        this.graph[i][testId] = results[i].performTime
                    }
                    else {
                        this.graph[i][testId] = results[i].performTime
                    }
                }
                this.forceUpdate()
            })

    }

    generateGraph = () => {
        if (this.graph.length === 0)
            return null

        let lines = []
        Object.keys(this.graph[0]).forEach(function(key, index) {
            if (key !== "name")
                lines.push(<Line type="monotone" key={key} data={key} stroke="#fff" />)
        })

        console.log(lines)
        return (<LineChart width={600} height={300} data={this.graph}
            margin={{top: 5, right: 30, left: 20, bottom: 5}}>
            <XAxis dataKey="name"/>
            <YAxis/>
            <Legend />
            {lines}
        </LineChart>)
    }
    render() {
        let rows = []
        if (!this.props.getResultAgg.loading)
            rows = this.props.getResultAgg.getResultAgg

        let graph = this.generateGraph()
        return(
            <div className='showResult'>
                <div className='eventList'>
                    <ReactTable filterable defaultSorted={[{id: 'testId', desc: true}]}
                    data={rows}
                    loading = {this.props.getResultAgg.loading}
                    columns = {[
                            {Header: 'Test', accessor: 'testId'},
                            {
                                filterable: false,
                                width: 60,
                                Cell: ({ original }) => (<Checkbox toggle onChange={() => this.showTest(original.testId)} />)
                            },
                    ]} />
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
