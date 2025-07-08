import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <-- ADD THIS LINE
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter> {/* <-- ADD THIS WRAPPER */}
      <App />
    </BrowserRouter> {/* <-- ADD THIS WRAPPER */}
  </React.StrictMode>,
);
