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
import ImageDiff from 'react-image-diff'

const queries = {
    getResult: gql`
        query getResult($appId: ID!, $scenarioId: ID!, $testId: Int!) {
            getResult(appId: $appId, scenarioId: $scenarioId, testId: $testId) {
                id
                image
                score
            }
        }`,
}

class comparator extends Component {

    render() {
        let before, after
        console.log(this.props)
        if (!this.props.testResult.loading)
            after = 'http://127.0.0.1:5900' + this.props.testResult.getResult[0].image.substr('/screenshot'.length + 1)

        if (!this.props.regressResult.loading)
            before = 'http://127.0.0.1:5900' + this.props.regressResult.getResult[0].image.substr('/screenshot'.length + 1)

        if (!(before && after))
            return null

        return(
            <ImageDiff before={before} after={after} type='fade' value={.5} />
        )
    }
};

export const Comparator = compose(graphql(queries.getResult, { name: 'testResult',
                    options: (props) => ({ variables: { appId: props.appId, scenarioId: props.scenarioId,
                            testId: props.testId }})}),
                graphql(queries.getResult, { name: 'regressResult',
                    options: (props) => ({ variables: { appId: props.appId, scenarioId: props.scenarioId,
                            testId: props.regressTestId }})})
        )(comparator)
