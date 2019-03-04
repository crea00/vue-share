import '@babel/polyfill';
import Vue from 'vue';
import './plugins/vuetify';
import App from './App.vue';
import router from './router';
import store from './store';

import ApolloClient from 'apollo-boost';
import VueApollo from 'vue-apollo';

Vue.use(VueApollo);

// Setup ApolloClient
export const defaultClient = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  // include auth token with requests made to backend
  fetchOptions: {
    credentials: 'include'
  },
  request: operation => {
    // If no token with key of 'token' in localStorage, add it
    if(!localStorage.token) {
      localStorage.setItem('token', '');
    }

    // operation adds the token to an authorization header, which is sent to backend
    operation.setContext({
      headers: {
        authorization: localStorage.getItem('token')
      }
    })
  },
  onError: ({ graphQLErrors, networkError }) => {
		console.log('TCL: networkError', networkError)
		console.log('TCL: graphQlErrors', graphQLErrors)
    
    if(networkError) {
      console.log('[networkError]', networkError);
    }

    if(graphQLErrors) {
      for(let err of graphQLErrors) {
        console.log(err);
      }
    }
  }
});

const apolloProvider = new VueApollo({ defaultClient });

Vue.config.productionTip = false;

new Vue({
  apolloProvider,
  router,
  store,
  render: h => h(App)
}).$mount('#app');
