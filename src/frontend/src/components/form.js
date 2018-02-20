import React, { Component } from 'react';
import { Form, Header, Button, Icon } from 'semantic-ui-react';
import '../css/form.css';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { toast } from 'react-toastify';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'; // ES6

const submitRepository = gql`
    mutation createScenario($id: String!, $domain: String!, $created: String!) {
        createScenario(id: $id, domain: $domain, created: $created) {
            ok
        }
    }
`;

class createScenario extends Component {
    state = { name: '', domain: 'http://' , loading: false};

    handleChange = (e) => {
        const {name, value} = e.target;
        this.setState({ [name]: value });
    };

    handleSubmit = () => {
        this.setState({ loading: true });
        console.log(this.state);
        this.props.postScenario({
                variables: {
                    id: this.state.name,
                    domain: this.state.domain,
                    created: (new Date()).getTime()
                }})
                .then(({data}) => {
                    if (data.createScenario.ok) {
                        this.setState({ loading: false });
                        setTimeout(this.props.changeFormState, 1000);
                        toast.success("Scenario " + this.state.name + " for domain " +
                                this.state.domain + "\nwas successful created", {
                                    className: {
                                        'background': '#2ba04d',
                                        'font-weight': 'bold',
                                        'color': 'white',
                                    }
                                });
                    }
                });
    };

    render() {
        return(
        <ReactCSSTransitionGroup
                transitionName='effect'
                transitionAppear={true}
                transitionAppearTimeout={500}
                transitionEnterTimeout={700}
                transitionLeaveTimeout={500}
                component="div" className='createScenario'>
            <Header as='h2' size='large' textAlign='center' attached='top'>
                Create scenario
            </Header>
            <div className='form'>
                <Form size='small' widths='equal' inverted
                        onSubmit={this.handleSubmit}>
                    <Form.Field required inline width='16' >
                        <label>Name:</label>
                        <input name='name' value={this.state.name} onChange={this.handleChange} />
                    </Form.Field>
                    <Form.Field required inline width='16' >
                        <label>Domain:</label>
                        <input name='domain' type='url' placeholder='example.com'
                                value={this.state.domain}
                                onChange={this.handleChange}/>
                    </Form.Field>
                    <Button compact positive floated='right' loading={this.state.loading}>
                        <Icon name='save' />
                        Save
                    </Button>
                    <Button compact negative floated='left' onClick={this.props.changeFormState}>
                        <Icon name='cancel' />
                        Cancel
                    </Button>
                </Form>
            </div>
            </ReactCSSTransitionGroup>)
    }
};

export const
        CreateScenario = graphql(submitRepository, { name: 'postScenario' })(createScenario);
