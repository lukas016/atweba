import React, { Component } from 'react';
import { Button, Header, Icon, Loader, Table, Popup } from 'semantic-ui-react';
import { compose, graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { FormattedDate } from 'react-intl';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // ES6
import { toast } from 'react-toastify';
import '../css/list.css';

const queries = {
    getAllScenarios: gql`
        query scenario($scenarioId: ID!) {
            scenario(scenarioId: $scenarioId) {
                scenarioId
                events
        }}`
}

class scenarioList extends Component {
    state = { }

    disableLoading(id, operation) {
        let stateId = this.state.applications
        let index = stateId[id].indexOf(operation)
        stateId[id].splice(index, 1)
        this.setState({ applications: {...stateId} })
    }

    render() {
        let Rows = []
        if (!this.props.getAllScenarios.loading &&
                Array.isArray(this.props.getAllScenarios.scenario))
            Rows = this.props.getAllScenarios.scenario

        return(
            <div style={{padding: '10px'}}>
            <Loader active={this.props.getAllScenarios.loading} inverted>
                Loading list of applications
            </Loader>
            <Table basic='very' celled inverted selectable>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>UUID</Table.HeaderCell>
                        <Table.HeaderCell>Count of events</Table.HeaderCell>
                        <Table.HeaderCell>State</Table.HeaderCell>
                        <Table.HeaderCell>Action</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <ReactCSSTransitionGroup
                    transitionName='effect'
                    transitionAppear={true}
                    transitionAppearTimeout={500}
                    transitionEnterTimeout={700}
                    transitionLeaveTimeout={500}
                    component={Table.Body}>
                    {Rows.map(({scenarioId, events}) => (
                        <Table.Row key={scenarioId}>
                            <Table.Cell>
                                {scenarioId}
                            </Table.Cell>
                            <Table.Cell textAlign='center'>
                                {events}
                            </Table.Cell>
                            <Table.Cell textAlign='center'>
                                <Icon name='checkmark' color='green' circular inverted />
                            </Table.Cell>
                            <Table.Cell>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </ReactCSSTransitionGroup>
            </Table>
            </div>
        )
    }
};

export const
        ListScenario = compose(
                withApollo,
                graphql(queries.getAllScenarios, { name: 'getAllScenarios',
                        options: (props) => ({ variables: { scenarioId: props.id },
                            pollInterval: 5000 })})
                )(scenarioList);
