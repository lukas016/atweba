import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'semantic-ui-css/semantic.css';
//import './css/semantic-cyborg-min.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

const apiAddr = new HttpLink({uri: 'http://localhost:5900'})

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
