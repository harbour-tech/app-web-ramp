import { ReactNode, createContext, useEffect, useState } from 'react';

interface LocalAddressesContextType {
  localAddresses: string[];
  setLocalAddresses: (localAddresses: string[]) => void;
  clearLocalAddresses: () => void;
}

export const LocalAddressesContext = createContext<LocalAddressesContextType>(
  {} as LocalAddressesContextType,
);

export const LocalAddressesContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [localAddresses, _setLocalAddresses] = useState<string[]>([]);
  useEffect(() => {
    const addresses = localStorage.getItem('localAddresses');
    if (addresses) {
      _setLocalAddresses(JSON.parse(addresses));
    }
  }, []);

  const clearLocalAddresses = () => {
    _setLocalAddresses([]);
    localStorage.removeItem('localAddresses');
  };

  const setLocalAddresses = (localAddresses: string[]) => {
    const addressesStringify = localStorage.getItem('localAddresses') || '[]';
    const uniqueAddresses = Array.from(
      new Set([...JSON.parse(addressesStringify), ...localAddresses]),
    );
    _setLocalAddresses(uniqueAddresses);
    localStorage.setItem('localAddresses', JSON.stringify(uniqueAddresses));
  };

  return (
    <LocalAddressesContext.Provider
      value={
        {
          localAddresses,
          setLocalAddresses,
          clearLocalAddresses,
        } as LocalAddressesContextType
      }
    >
      {children}
    </LocalAddressesContext.Provider>
  );
};
