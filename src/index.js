import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Глобальные стили для устранения белых пустот
const globalStyles = `
  * {
    box-sizing: border-box;
  }
  
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  
  #root {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
  }
`;

const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = globalStyles;
document.head.appendChild(styleSheet);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);