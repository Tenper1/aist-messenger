import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';

// Глобальные стили: фиксированный экран для мессенджера, прокрутка для лэндинга
const globalStyles = `
  * { box-sizing: border-box; }
  html {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    -webkit-text-size-adjust: 100%;
    -webkit-tap-highlight-color: transparent;
    background: #0e1621;
  }
  body {
    margin: 0;
    padding: 0;
    width: 100%;
    min-height: 100%;
    overscroll-behavior: none;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-x pan-y;
    background: #0e1621;
    color: #fff;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
    font-feature-settings: "kern" 1, "liga" 1;
    -webkit-font-smoothing: antialiased;
  }
  /* Фиксированный режим для мессенджера */
  body.messenger-mode {
    position: fixed;
    overflow: hidden;
    height: 100vh;
  }
  /* Прокручиваемый режим для лэндинга и других публичных страниц */
  body.landing-mode {
    overflow-y: auto;
    overflow-x: hidden;
  }
  #root {
    width: 100%;
    margin: 0;
    padding: 0;
    position: relative;
  }
  body.messenger-mode #root {
    height: 100%;
    overflow: hidden;
  }
  .scrollable::-webkit-scrollbar { width: 6px; height: 6px; }
  .scrollable::-webkit-scrollbar-track { background: transparent; }
  .scrollable::-webkit-scrollbar-thumb { background: rgba(0,0,0,.2); border-radius: 3px; }
  .scrollable::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,.3); }
`;

const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = globalStyles;
document.head.appendChild(styleSheet);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <UserProvider>
            <App />
          </UserProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);