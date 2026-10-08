import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import './style.css';

// Safely suppress benign Vite HMR websocket notices and App Check network warnings in preview
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = typeof reason === 'string' ? reason : (reason?.message || String(reason || ''));
    if (
      msg.includes('WebSocket closed without opened') ||
      msg.includes('failed to connect to websocket') ||
      msg.includes('appCheck/fetch-status-error') ||
      msg.includes('AppCheck') ||
      (typeof reason === 'object' && reason?.type === 'close')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element to mount the Demon Codex application.');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

export default App;
