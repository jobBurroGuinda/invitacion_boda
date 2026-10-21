import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <GoogleReCaptchaProvider reCaptchaKey="6Lc-_n0tAAAAAMoOgGyWgcJlsNTqsgeEO3ckeBZY">
      <App />
    </GoogleReCaptchaProvider>
    </BrowserRouter>
    <Toaster
      position="top-center"
      toastOptions={{
        success: {
          duration: 5000,
          style: {
            background: '#fff',
            color: '#333',
            fontSize: '16px',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            border: '1px solid #e8c9a0'
          },
          iconTheme: { primary: '#c8a97e', secondary: '#fff' }
        },
        error: {
          duration: 5000,
          style: {
            background: '#fff',
            color: '#333',
            fontSize: '16px',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
          }
        }
      }}
    />
  </React.StrictMode>
);
