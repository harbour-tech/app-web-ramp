import { AssetsAndWalletsContext } from './AssetsAndWalletsContext';
import { useContext } from 'react';

export const useAssetsAndWallets = () => useContext(AssetsAndWalletsContext);
