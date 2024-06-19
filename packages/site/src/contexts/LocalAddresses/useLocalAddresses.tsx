import { LocalAddressesContext } from './LocalAddressesContext';
import { useContext } from 'react';

export const useLocalAddresses = () => useContext(LocalAddressesContext);
