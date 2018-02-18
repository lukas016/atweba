import React from 'react';
import { Form, Header, Button, Icon } from 'semantic-ui-react';
import '../css/form.css';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

const submitRepository = gql`
  mutation submitRepository($repoFullName: String!) {
      submitRepository(repoFullName: $repoFullName) {
            createdAt
          }
    }
`;

const createScenario = (state) => {
    console.log(state)
    return (
    <div className='createScenario'>
        <Header as='h2' size='large' textAlign='center' attached='top'>
            Create scenario
        </Header>
        <div className='form'>
            <Form size='small' widths='equal' inverted>
                <Form.Field required inline width='20' inverted>
                    <label>Name:</label>
                    <input name='name' />
                </Form.Field>
                <Form.Field required inline width='20' inverted>
                    <label>Domain:</label>
                    <input name='domain' type='url' placeholder='example.com' />
                </Form.Field>
                <Button compact positive floated='right'>
                    <Icon name='save' />
                    Save
                </Button>
                <Button compact negative floated='left'>
                    <Icon name='cancel' />
                    Cancel
                </Button>
            </Form>
        </div>
    </div>)
};

export const
        CreateScenario = graphql(submitRepository)(createScenario);
