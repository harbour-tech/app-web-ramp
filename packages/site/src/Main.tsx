import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Root } from '@/Root';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { OnboardingModalProvider } from '@/contexts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OnboardingModalProvider>
      <ThemeProvider>
        <Root />
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </ThemeProvider>
    </OnboardingModalProvider>
  </React.StrictMode>,
);
