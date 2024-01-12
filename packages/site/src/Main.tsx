import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Root } from '@/Root';
import { ThemeProvider } from '@/providers/ThemeProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  </React.StrictMode>,
);
