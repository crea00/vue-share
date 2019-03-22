import Vue from 'vue';
import Vuex from 'vuex';
import router from './router';

import { defaultClient as apolloClient } from './main';

import { GET_CURRENT_USER, GET_POSTS, SIGNIN_USER } from './queries';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    posts: [],
    user: null,
    loading: false
  },
  mutations: {
    setPosts: (state, payload) => {
      state.posts = payload;
    },
    setUser: (state, payload) => {
      state.user = payload;
    },
    setLoading: (state, payload) => {
      state.loading = payload;
    },
    clearUser: state => (state.user = null)
  },
  actions: {
    getCurrentUser: ({ commit }) => {
      commit('setLoading', true);
      apolloClient.query({
        query: GET_CURRENT_USER
      })
      .then(({ data }) => {
        commit('setLoading', false);
        // Add user data to state
        commit('setUser', data.getCurrentUser);
        console.log(data.getCurrentUser);
      })
      .catch(err => {
        commit('setLoading', false);
        console.error(err);
      })
    },
    getPosts: ({ commit }) => {
      commit('setLoading', true);
      // Use ApolloClient to fire getPosts query
      apolloClient
        .query({
          query: GET_POSTS
        })
        .then(({ data }) => {
          // Get data from actions to state via mutations
          // Commit passes data from actions along to mutation functions
          commit('setPosts', data.getPosts);
          commit('setLoading', false);
        })
        .catch(err => {
          commit('setLoading', false);
          console.error(err);
        });
    },
    signinUser: ({ commit }, payload) => {
      // Clear token to prevent errors (if malformed)
      localStorage.setItem('token', '');
      apolloClient
        .mutate({
          mutation: SIGNIN_USER,
          variables: payload
        })
        .then(({ data }) => {
          localStorage.setItem('token', data.signinUser.token);
          // To make sure created method is run in main.js (we run getCurrentUser), reload the page
          router.go();    // just refresh the current page
        })
        .catch(err => {
          console.error(err);
        });
    },
    signoutUser: async ({ commit }) => {
      // Clear user in state
      commit('clearUser');
      // Remove token in localStorage
      localStorage.removeItem('token', '');
      // End session
      await apolloClient.resetStore();
      //Redirect home - kick users out of private pages(i.e. profile)
      router.push('/');
    }
  },
  getters: {
    posts: state => state.posts,
    user: state => state.user,
    loading: state => state.loading
  }
});
