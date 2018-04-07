import React, { Component } from 'react';
import { Button, Icon, Popup } from 'semantic-ui-react';
import { compose, graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { FormattedDate } from 'react-intl';
import { toast } from 'react-toastify';
import '../css/list.css';
import { semanticFilter, semanticDateRangeFilter } from './simpleComponents.js'
import '../css/react-table.css'
import ReactTable from 'react-table'

const formatDate = (seconds) => (
    <div style={{textAlign: 'center'}}>
        <FormattedDate value={new Date(0).setSeconds(seconds)} day='numeric' month='numeric' year='numeric'/>
    </div>
)

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
    state = { startDate: 0, endDate: 0 }

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

            let applications = {}
            Rows.map(({id}) => applications[id] = [])
            this.state.applications = applications
        }
        return(
            <ReactTable filterable defaultSorted={[{id: 'created', desc: true}]}
                    data={Rows}
                    loading = {this.props.getAllApp.loading}
                    columns = {[
                            {Header: 'Domain', accessor: 'domain',
                                filterMethod: (filter, row) =>
                                    row[filter.id].startsWith(filter.value) &&
                                    row[filter.id].endsWith(filter.value),
                                Filter: semanticFilter,
                                minWidth: 200, maxWidth: 600},
                            {Header: 'Name', accessor: 'id',
                                Filter: semanticFilter},
                            {Header: 'Created', accessor: 'created',
                                filterMethod: (filter, row ) => {
                                    if (filter.value[1] === 'start')
                                        this.state.startDate = filter.value[0]
                                    else
                                        this.state.endDate = filter.value[0]

                                    let oneDaySec = 86400
                                    let startSec = new Date(this.state.startDate).getTime() / 1000;
                                    let endSec = new Date(this.state.endDate).getTime() / 1000 + oneDaySec;
                                    if (startSec > endSec)
                                        return false

                                    return row[filter.id] > startSec && row[filter.id] < endSec},
                                    Filter: x => semanticDateRangeFilter(x, this),
                                Cell: row => formatDate(row.value),
                                width: 305},
                            {Header: 'Actions',
                                filterable: false,
                                sortable: false,
                                maxWidth: 160,
                                Cell: row => (
                                    <div>
                                    <Popup inverted
                                        trigger={
                                            <Button icon='file code outline' color='green' compact inverted circular
                                                    loading={this.state.applications[row.original.id] && this.state.applications[row.original.id].indexOf('client') !== -1}
                                                    onClick={() => this.generateClientUrl(row.original.id)}>
                                            </Button>}
                                        content='Generate script into testing page'
                                    />
                                    <Popup inverted
                                        trigger={
                                            <Button icon='file text' compact inverted circular color='violet'
                                                onClick={() => this.props.showScenarios(row.original.id)}>
                                            </Button>}
                                        content='Tests'
                                    />
                                    <Popup inverted
                                        trigger={
                                            <Button icon='delete' compact color='red' floated='right' circular
                                                    loading={this.state.applications[row.original.id] && this.state.applications[row.original.id].indexOf('delete') !== -1}
                                                    onClick={() => this.deleteApp(row.original.id)}>
                                            </Button>}
                                        content='Delete application'
                                    />
                                    </div>)
                            }
                    ]}
            />
            )
    }
};

export const
        ListApp = compose(
                withApollo,
                graphql(queries.getAllApp, { name: 'getAllApp', options: { pollInterval: 5000 }})
                )(appList);
