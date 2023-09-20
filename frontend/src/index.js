import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

if(!localStorage.getItem('themeContextValue')){
    localStorage.setItem('themeContextValue', 'light');
}
const loadedTheme = localStorage.getItem('themeContextValue');
document.documentElement.setAttribute('data-theme', loadedTheme);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

