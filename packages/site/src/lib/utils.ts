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
