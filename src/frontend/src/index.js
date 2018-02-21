import React from 'react'
import ReactDOM from 'react-dom'
import './css/main.css'
import 'semantic-ui-css/semantic.css'
//import './css/semantic-cyborg-min.css';
import App from './App'
import './css/effect.css'
import registerServiceWorker from './registerServiceWorker'
import { toast } from 'react-toastify'

import { ApolloProvider } from 'react-apollo'
import { ApolloLink } from 'apollo-link'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { onError } from 'apollo-link-error'
import { InMemoryCache } from 'apollo-cache-inmemory'

const apiAddr = new HttpLink({uri: '/graphql'})

const errorLink = onError(({networkError, graphQLErrors}) => {
    const errorNotify = {
                'background': '#d81111',
                'fontWeight': 'bold',
                'color': 'white',
    }

    if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
            toast.error(message, { className: errorNotify }));
    }
    if (networkError) toast.error(`NetworkError: ${networkError}`, { className: errorNotify });
});

const link = ApolloLink.from([
    errorLink,
    apiAddr,
]);

const client = new ApolloClient({
    link: link,
    cache: new InMemoryCache()
})

ReactDOM.render(
    <ApolloProvider client={client}>
        <App />
    </ApolloProvider>,
    document.getElementById('root'))
registerServiceWorker();
