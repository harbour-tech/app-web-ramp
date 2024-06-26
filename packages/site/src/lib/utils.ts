import { type ClassValue, clsx } from 'clsx';
import { isFirefox } from 'react-device-detect';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const installationLink = () => {
  let installationLink = import.meta.env.VITE_FLASK_INSTALLATION
    ? 'https://chromewebstore.google.com/detail/metamask-flask-developmen/ljfoeinjpaedjfecbmggjgodbgkmjkjk'
    : 'https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn';

  if (isFirefox) {
    installationLink =
      'https://addons.mozilla.org/pl/firefox/addon/ether-metamask/';
  }
  return installationLink;
};

export const handle32002 = () => {
  alert(
    'There is a pending request to connect to MetaMask. Please approve or reject the request by clicking on the MetaMask extension icon in your browser toolbar. Once you have done this, you can proceed with your current action.',
  );
};
