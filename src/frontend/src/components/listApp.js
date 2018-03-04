import React, { Component } from 'react';
import { Button, Icon, Table, Popup } from 'semantic-ui-react';
import { compose, graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { FormattedDate } from 'react-intl';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // ES6
import '../css/list.css';

const queries = {
    getAllApp: gql`
        query app {
            app {
                id
                domain
                created
        }}`,
    generateClientUrl: gql`
        query generateClientUrl($id: String!) { generateClientUrl(id: $id) }
    `};

class appList extends Component {
    state = { id: [] }

    formatDate(seconds) {
        let date = new Date(0);
        date.setSeconds(seconds)
        return (<FormattedDate value={date} day='numeric' month='numeric' year='numeric'/>);
    }

    disableLoading(id) {
        let stateId = this.state.id;
        let index = stateId.indexOf(id)
        stateId.splice(index, 1)
        this.setState({ id: stateId })
    }

    generateClientUrl = (id) => {
        let stateId = this.state.id
        stateId.push(id)
        this.setState({ id: stateId })
        console.log(this.state)
        const client = this.props.client.query
        client({query: queries.generateClientUrl, variables: { id: id }})
                .then(({data}) => {
                    window.location.href = "http://127.0.0.1:5900" + data.generateClientUrl
                    this.disableLoading(id)
                })
                .catch(() => { this.disableLoading(id) })
    }

    render() {
        let Rows = []
        if (!this.props.getAllApp.loading &&
                Array.isArray(this.props.getAllApp.app)) {
            Rows = this.props.getAllApp.app.slice();
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
            <Table basic='very' celled striped inverted>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Domain</Table.HeaderCell>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Created</Table.HeaderCell>
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
                    {Rows.map(({id, domain, created}) => (
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
                                <Popup inverted
                                    trigger={
                                        <Button icon inverted compact circular inverted
                                            color='green' loading={this.state.id.indexOf(id) !== -1}
                                        onClick={() => this.generateClientUrl(id)}>
                                            <Icon name='file code outline' size='large' />
                                        </Button>}
                                    content='Generate script into testing page'
                                />
                                <Popup inverted
                                    trigger={
                                        <Button icon compact inverted circular color='yellow'
                                                onClick={() => this.generateClientUrl(id)}>
                                            <Icon name='edit' size='large' />
                                        </Button>}
                                    content='Editor'
                                />
                                <Popup inverted
                                    trigger={
                                        <Button icon compact inverted circular color='violet'
                                                onClick={() => this.generateClientUrl(id)}>
                                            <Icon name='file text' size='large' />
                                        </Button>}
                                    content='Report'
                                />
                                <Popup inverted
                                    trigger={
                                        <Button icon compact color='red' floated='right' size='large'
                                                onClick={() => this.generateClientUrl(id)}>
                                            Delete
                                        </Button>}
                                    content='Delete scenario'
                                />
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </ReactCSSTransitionGroup>
            </Table>)
    }
};

export const
        ListApp = compose(
                withApollo,
                graphql(queries.getAllApp, { name: 'getAllApp', options: { pollInterval: 5000 }})
                )(appList);
