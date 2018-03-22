import React, { Component } from 'react';
import { Button, Divider, Grid,  Header, Icon, List, Loader, Table, Popup, Search } from 'semantic-ui-react';
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
            <Grid columns={2} celled inverted doubling>
                <Grid.Column width={4}>
                    <List animated size='small' celled inverted>
                        {Rows.map(({scenarioId, events}) => (
                            <List.Item>
                                <List.Content>
                                <List.Header>{scenarioId}</List.Header>
                                Count of Events: {events}
                                </List.Content>
                            </List.Item>
                        ))}
                    </List>
                </Grid.Column>
                <Grid.Column width={12}>
                <Table basic='very' inverted selectable>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>UUID</Table.HeaderCell>
                        <Table.HeaderCell textAlign='center'>Count of events</Table.HeaderCell>
                        <Table.HeaderCell textAlign='center'>State</Table.HeaderCell>
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
            </Grid.Column>
            </Grid>
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
