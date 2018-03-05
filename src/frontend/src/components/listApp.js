import React, { Component } from 'react';
import { Button, Icon, Loader, Table, Popup } from 'semantic-ui-react';
import { compose, graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { FormattedDate } from 'react-intl';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // ES6
import { toast } from 'react-toastify';
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
    `,
    deleteApp: gql`
        query deleleApp($id: ID!) { deleteApp(id: $id) }
    `};

class appList extends Component {
    state = { }

    formatDate(seconds) {
        let date = new Date(0);
        date.setSeconds(seconds)
        return (<FormattedDate value={date} day='numeric' month='numeric' year='numeric'/>);
    }

    disableLoading(id, operation) {
        let stateId = this.state.applications
        let index = stateId[id].indexOf(operation)
        stateId[id].splice(index, 1)
        this.setState({ applications: {...stateId} })
    }

    generateClientUrl(id) {
        let stateId = this.state.applications
        stateId[id].push('client')
        this.setState({ applications: {...stateId} })
        const client = this.props.client.query
        client({query: queries.generateClientUrl, variables: { id: id }})
                .then(({data}) => {
                    window.location.href = "http://127.0.0.1:5900" + data.generateClientUrl
                    this.disableLoading(id, 'client')
                })
                .catch(() => { this.disableLoading(id, 'client') })
    }

    deleteApp(id) {
        let stateId = this.state.applications
        stateId[id].push('delete')
        this.setState({ applications: stateId })
        const client = this.props.client.query
        client({query: queries.deleteApp, variables: { id: id }})
                .then(({data}) => {
                    toast.success("Application " + id + "\nwas successful deleted", {
                                className: {
                                'background': '#2ba04d',
                                'fontWeight': 'bold',
                                'color': 'white',
                                }
                            });

                    this.disableLoading(id, 'delete')
                })
                .catch(() => { this.disableLoading(id, 'delete') })
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
            if (!('applications' in this.state)) {
                let applications = {}
                Rows.map(({id}) => (
                    applications[id] = []
                ))
                this.state.applications = applications
            }
        }
        return(
            <div>
            <Loader active={this.props.getAllApp.loading} inverted>
                Loading list of applications
            </Loader>
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
                                        <Button icon inverted compact circular color='green'
                                                loading={this.state.applications[id].indexOf('client') !== -1}
                                                onClick={() => this.generateClientUrl(id)}>
                                            <Icon name='file code outline' size='large' />
                                        </Button>}
                                    content='Generate script into testing page'
                                />
                                <Popup inverted
                                    trigger={
                                        <Button icon compact inverted circular color='violet'>
                                            <Icon name='file text' size='large' />
                                        </Button>}
                                    content='Tests'
                                />
                                <Popup inverted
                                    trigger={
                                        <Button icon compact color='red' floated='right' size='large'
                                                loading={this.state.applications[id].indexOf('delete') !== -1}
                                                onClick={() => this.deleteApp(id)}>
                                            Delete
                                        </Button>}
                                    content='Delete application'
                                />
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </ReactCSSTransitionGroup>
            </Table></div>)
    }
};

export const
        ListApp = compose(
                withApollo,
                graphql(queries.getAllApp, { name: 'getAllApp', options: { pollInterval: 5000 }})
                )(appList);
