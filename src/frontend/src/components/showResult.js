import React, { Component } from 'react';
import { Icon, Step, Grid } from 'semantic-ui-react';
import { compose, graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import Comparator from './comparator.js'
import '../css/comparator.css'

const queries = {
    getResult: gql`
        query getResult($appId: ID!, $scenarioId: ID!, $testId: Int!) {
            getResult(appId: $appId, scenarioId: $scenarioId, testId: $testId) {
                id
                image
                score
            }
        }`,
    getTest: gql`
        query getTest($appId: ID!, $scenarioId: ID!) {
            getTest(appId: $appId, scenarioId: $scenarioId) {
                locator
                path
                timestamp
                type
                url
            }
        }`,
}

class showResult extends Component {
    constructor(props) {
        super(props)
        this.state = {active: null}
    }

    getIconName = (type) => {
        switch(type) {
            case 'click':
                return 'mouse pointer'
            case 'focusout':
                return 'keyboard'
            default:
                return 'help'
        }
    }

    changeComparator = (timestamp) => this.setState({active: timestamp})

    generateComparator = () => {
        const imageServer = 'http://127.0.0.1:5900/'
        if (this.state.active === null)
            return null

        console.log(this.props)
        console.log(this.state.active)
        const after = imageServer + this.props.testResult.getResult[this.state.active].image.substr('./screenshot/'.length)
        const before = imageServer + this.props.regressResult.getResult[this.state.active].image.substr('./screenshot/'.length)
        return <Comparator before={before} after={after} />
    }

    getScore = (index) => {
    }

    generateSteps = () => {
        let steps = Array()
        const tmpPointer = this
        for (let index in this.props.getTest.getTest) {
            const {locator, url, timestamp, path, type} = this.props.getTest.getTest[index]
            steps.push(<Step key={index} active={index === tmpPointer.state.active}
                    onClick={() => tmpPointer.changeComparator(index)}>
                        <Icon name={tmpPointer.getIconName(type)} size='small' />
                        <Step.Content>
                            <Step.Description>
                                Score: {tmpPointer.getScore(index)}
                                Locator: {locator}<br/>
                                URL: {url}<br/>
                                timestamp: {timestamp}<br/>
                                path: {path.join(' > ')}<br/>
                            </Step.Description>
                        </Step.Content>
                    </Step>)
        }
        return steps
    }

    render() {
        if (this.props.testResult.loading || this.props.regressResult.loading || this.props.getTest.loading)
            return null

        let steps = this.generateSteps()

        let comparator = this.generateComparator()

        return(
            <div className='showResult'>
                <div className='eventList'>
                    <Step.Group fluid vertical ordered items={steps} />
                </div>
                <div className='comparatorWrapper'>
                    {comparator}
                </div>
            </div>
        )
    }
};

export const ShowResult = compose(graphql(queries.getResult, { name: 'testResult',
                    options: (props) => ({ variables: { appId: props.appId, scenarioId: props.scenarioId,
                            testId: props.testId }})}),
                graphql(queries.getResult, { name: 'regressResult',
                    options: (props) => ({ variables: { appId: props.appId, scenarioId: props.scenarioId,
                            testId: props.regressTestId }})}),
                graphql(queries.getTest, { name: 'getTest',
                    options: (props) => ({ variables: { appId: props.appId, scenarioId: props.scenarioId }})}),
        )(showResult)