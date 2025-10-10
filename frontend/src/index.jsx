import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { setApiErrorHandler } from './api/client';
import { ToastProvider, useToast } from './components/Toast';

function Root() {
  const { show } = useToast();
  useEffect(() => {
    setApiErrorHandler((err) => {
      show(err.message || 'Request failed');
    });
  }, [show]);
  return <App />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ToastProvider>
      <Root />
    </ToastProvider>
  </React.StrictMode>
);
