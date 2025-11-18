import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { initializeProjectKey } from './utils/project-key';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

initializeProjectKey();

const client = new ApolloClient({
  uri: 'https://your-graphql-endpoint.com/graphql', // replace with your GraphQL endpoint
  cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);
