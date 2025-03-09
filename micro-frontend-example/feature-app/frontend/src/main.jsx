import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import CategoryManager from './components/CategoryManager';
import { standaloneStore } from './store';
import './index.css';

// This is only used when running the app standalone
// When used as a remote in Module Federation, this code won't be executed
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={standaloneStore}>
      <CategoryManager />
    </Provider>
  </React.StrictMode>
); 