// React
import React from 'react';
import ReactDOM from 'react-dom/client';

// Styles
import './index.scss';

// Components
import App from './App';

// Utilities
import reportWebVitals from './reportWebVitals';
import * as serviceWorker from './serviceWorker';

// Routing
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);

// Performance Monitoring
reportWebVitals();

// Service Worker
serviceWorker.register();