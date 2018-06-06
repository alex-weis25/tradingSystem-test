/**
 * THIS IS THE ENTRY POINT FOR THE CLIENT, JUST LIKE server.js IS THE ENTRY POINT FOR THE SERVER.
 */
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import createStore from './redux/create';
import io from 'socket.io-client';
import { Provider } from 'react-redux';
import ApiClient from './helpers/ApiClient.js';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { ReduxAsyncConnect } from 'redux-async-connect';
import useScroll from 'scroll-behavior/lib/useStandardScroll';

import getRoutes from './routes';

const client = new ApiClient();
const _browserHistory = useScroll(() => browserHistory)();
const dest = document.getElementById('content');
const store = createStore(_browserHistory, client, window.__data);
const history = syncHistoryWithStore(_browserHistory, store);

function initSocket() {
  const socket = io('', {
    path: '/ws',
    'reconnection': true,
    'reconnectionDelay': 500,
    'reconnectionAttempts': 50
  });
  socket.on('snapshot', data => {
    console.log('snapshot data:', data);
    socket.emit('my other event', { my: 'data from client' });
  });
  socket.on('reconnect', attempts => {
    console.log('reconnected', attempts);
  });
  socket.on('update', data => {
    console.log(data);
  });
  socket.on('disconnect', () => {
    console.log('socket disconnected');
    // socket = undefined;
  });
  return socket;
}
global.socket = initSocket();

const component = (
  <Router
    render={props => (
      <ReduxAsyncConnect
        {...props}
        helpers={{ client }}
        filter={item => !item.deferred}
      />
    )}
    history={history}
  >
    {getRoutes(store)}
  </Router>
);

ReactDOM.render(
  <Provider store={store} key="provider">
    {component}
  </Provider>,
  dest
);
