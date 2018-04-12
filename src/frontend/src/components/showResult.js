import React, { Component } from 'react';
import { Icon, Step, Grid, Popup } from 'semantic-ui-react';
import { compose, graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import Comparator from './comparator.js'
import '../css/comparator.css'

const queries = {
    getResult: gql`
        query getResult($appId: ID!, $scenarioId: ID!, $testId: [Int!]) {
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
            case 'mouseover':
                return 'object ungroup'
            default:
                return 'help'
        }
    }

    changeComparator = (timestamp) => this.setState({active: timestamp})

    generateComparator = () => {
        if (this.state.active === null)
            return null

        console.log(this.props)
        console.log(this.state.active)
        const after = this.props.testResult.getResult[this.state.active].image
        const before = this.props.regressResult.getResult[this.state.active].image
        return <Comparator before={before} after={after} />
    }

    getScore = (index) => this.props.testResult.getResult[index].score

    getScoreClass = (index) => {
        if (this.props.testResult.loading)
            return ''

        switch (this.props.testResult.getResult[index].score) {
            case 1.0:
                return 'scoreSame'
            default:
                return 'scoreDiffrent'
        }
    }

    generateSteps = () => {
        let steps = Array()
        const tmpPointer = this
        for (let index in this.props.getTest.getTest) {
            const {locator, url, timestamp, path, type} = this.props.getTest.getTest[index]
            steps.push(<Popup inverted hoverable position='right center'
                        key={index}
                        trigger={<Step key={index} active={index === tmpPointer.state.active} className={tmpPointer.getScoreClass(index)}
                            onClick={() => tmpPointer.changeComparator(index)}>
                                <Icon name={tmpPointer.getIconName(type)} size='mini' />
                            </Step>}
                        content={<div>Score: {tmpPointer.getScore(index)}<br/>
                                Locator: {locator}<br/>
                                URL: {url}<br/>
                                timestamp: {timestamp}<br/>
                                path: {path.join(' > ')}<br/></div>
                        } />)
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
                    <Step.Group fluid vertical ordered size='mini' items={steps} />
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
                            testId: [props.testId] }})}),
                graphql(queries.getResult, { name: 'regressResult',
                    options: (props) => ({ variables: { appId: props.appId, scenarioId: props.scenarioId,
                            testId: [props.regressTestId] }})}),
                graphql(queries.getTest, { name: 'getTest',
                    options: (props) => ({ variables: { appId: props.appId, scenarioId: props.scenarioId }})}),
        )(showResult)
