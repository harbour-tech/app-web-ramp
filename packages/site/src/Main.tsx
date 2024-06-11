import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Root } from '@/Root';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { OnboardingModalProvider } from '@/contexts';

import Bugsnag from '@bugsnag/js';
import BugsnagPluginReact from '@bugsnag/plugin-react';

const apiKey = 'e285fb66c0e35636856bf5f0ca605a1c';
const client = Bugsnag.start({
  apiKey,
  plugins: [new BugsnagPluginReact()],
  releaseStage: import.meta.env.VITE_BUGSNAG_STAGE,
  onError: () => {
    if (!import.meta.env.VITE_BUGSNAG_STAGE) {
      return false;
    } else {
      return true;
    }
  },
  logger: null,
});

// eslint-disable-next-line react-refresh/only-export-components
const ErrorBoundary =
  client.getPlugin('react')?.createErrorBoundary(React) || React.Fragment;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
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
    </React.StrictMode>
  </ErrorBoundary>,
);
