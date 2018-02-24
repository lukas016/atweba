import React, { Component } from 'react';
import { Button, Icon, Table } from 'semantic-ui-react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // ES6
import '../css/list.css';

const getScenario = gql`
    query scenario {
        scenario {
            id
            domain
            created
}}`;

class scenarioList extends Component {
    state = { name: '', domain: 'http://' , loading: false};

    formatDate(seconds) {
        let date = new Date(0);
        date.setSeconds(seconds)
        return String(date);
    };

    render() {
        let Rows = []
        if (!this.props.getAllScenario.loading) {
            Rows = this.props.getAllScenario.scenario.slice();
            Rows.sort(function(a, b) {
                let A = a.domain.toLowerCase();
                let B = b.domain.toLowerCase();
                if (A < B) return -1;
                if (A > B) return 1;
                let idA = a.id.toLowerCase();
                let idB = b.id.toLowerCase();
                return (idA < idB) ? -1 : (idA > idB) ? 1 : 0
            })
        }
        return(
        <ReactCSSTransitionGroup
                transitionName='effect'
                transitionAppear={true}
                transitionAppearTimeout={500}
                transitionEnterTimeout={700}
                transitionLeaveTimeout={500}
                component="div">
                <Table basic='very' celled striped inverted>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Domain</Table.HeaderCell>
                            <Table.HeaderCell>Name</Table.HeaderCell>
                            <Table.HeaderCell>Created</Table.HeaderCell>
                            <Table.HeaderCell>Action</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {Rows.sort().map(({id, domain, created}) => (
                            <Table.Row key={id}>
                                <Table.Cell className='domain' >
                                    <Icon name='world' />
                                    {domain}
                                </Table.Cell>
                                <Table.Cell>
                                    {id}
                                </Table.Cell>
                                <Table.Cell>
                                    {this.formatDate(created)}
                                </Table.Cell>
                                <Table.Cell>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
        </ReactCSSTransitionGroup>)
    }
};

export const
        ListScenario = graphql(getScenario, { name: 'getAllScenario' })(scenarioList);
