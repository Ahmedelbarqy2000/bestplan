import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // تأكد أن ملف الـ CSS موجود حتى لو فارغ إذا استخدمت CDN
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
