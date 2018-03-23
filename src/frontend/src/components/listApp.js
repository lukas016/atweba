import React, { Component } from 'react';
import { Button, Icon, Loader, Table, Popup } from 'semantic-ui-react';
import { compose, graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { FormattedDate } from 'react-intl';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // ES6
import { toast } from 'react-toastify';
import '../css/list.css';
import { semanticFilter } from './simpleComponents.js'
import '../css/react-table.css'
import ReactTable from 'react-table'

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

            if (!('applications' in this.state)) {
                let applications = {}
                Rows.map(({id}) => (
                    applications[id] = []
                ))
                this.state.applications = applications
            }
        }
        return(
            <div style={{padding: '10px'}}>
            <Loader active={this.props.getAllApp.loading} inverted>
                Loading list of applications
            </Loader>
            <ReactTable filterable defaultSorted={[{id: 'created', desc: true}]}
                    data={Rows}
                    columns = {[
                            {Header: 'Domain', accessor: 'domain',
                                filterMethod: (filter, row) =>
                                    row[filter.id].startsWith(filter.value) &&
                                    row[filter.id].endsWith(filter.value),
                                Filter: semanticFilter},
                            {Header: 'Name', accessor: 'id',
                                Filter: (input) => semanticFilter(input, 'number')},
                            {Header: 'Name', accessor: 'created',
                                Filter: (input) => semanticFilter(input, 'date')}
                    ]}
            />
            </div>)
    }
};

export const
        ListApp = compose(
                withApollo,
                graphql(queries.getAllApp, { name: 'getAllApp', options: { pollInterval: 5000 }})
                )(appList);
