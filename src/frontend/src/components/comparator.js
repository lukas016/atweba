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
import Script from 'react-load-script'
import PropTypes from 'prop-types'
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

class Comparator extends Component {

    render() {
        let before, after
        if (!this.props.testResult.loading)
            this.props.after = 'http://127.0.0.1:5900' + this.props.testResult.getResult[0].image.substr('/screenshot'.length + 1)

        if (!this.props.regressResult.loading)
            this.props.before = 'http://127.0.0.1:5900' + this.props.regressResult.getResult[0].image.substr('/screenshot'.length + 1)

        return(
            <ImageDiff before='test' after='test' type='difference' value={.5} />
        )
    }
};

export default Comparator
