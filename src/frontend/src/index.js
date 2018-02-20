import React from 'react';
import ReactDOM from 'react-dom';
import './css/main.css';
import 'semantic-ui-css/semantic.css';
//import './css/semantic-cyborg-min.css';
import App from './App';
import './css/effect.css';
import registerServiceWorker from './registerServiceWorker';

import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

const apiAddr = new HttpLink({uri: '/graphql'})

const client = new ApolloClient({
    link: apiAddr,
    cache: new InMemoryCache()
})

ReactDOM.render(
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>,
    document.getElementById('root'))
registerServiceWorker();
