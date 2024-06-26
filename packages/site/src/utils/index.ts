import { BankAccount } from '@harbour/client/src/RampClient/types.ts';
import { GetAccountInfoResponse } from '@harbour/client/src/schema/gen/ramp/v1/public_pb.ts';

export * from './metamask';
export * from './snap';
export * from './erc20.ts';

export interface NetworkParams {
  chainId: string;
  chainName: string;
  nativeCurrency: { symbol: string; decimals: number; name: string };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export const ETHEREUM_MAINNET_PARAMS: NetworkParams = {
  chainId: '0x1',
  chainName: '',
  nativeCurrency: { decimals: 0, name: '', symbol: '' },
  rpcUrls: [],
  blockExplorerUrls: [],
};

export const ETHERUM_TESTNET_SEPOLIA_PARAMS: NetworkParams = {
  chainId: '0xaa36a7',
  chainName: 'Sepolia Test Network',
  nativeCurrency: {
    name: 'Sepolia ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com/'],
  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
};

export const AVALANCHE_MAINNET_PARAMS: NetworkParams = {
  chainId: '0xA86A',
  chainName: 'Avalanche Mainnet C-Chain',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://snowtrace.io/'],
};

export const AVALANCHE_FUJI_PARAMS: NetworkParams = {
  chainId: '0xA869',
  chainName: 'Avalanche Fuji Testnet',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://testnet.snowtrace.io/'],
};

export const POLYGON_MAINNET_PARAMS: NetworkParams = {
  chainId: '0x89',
  chainName: 'Polygon Mainnet',
  nativeCurrency: {
    name: 'Matic Polygon',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://polygon-rpc.com/'],
  blockExplorerUrls: ['https://polygonscan.com/'],
};

export const POLYGON_AMOY_PARAMS: NetworkParams = {
  chainId: '0x13882',
  chainName: 'Polygon Amoy',
  nativeCurrency: {
    name: 'Matic Polygon',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: ['https://rpc-amoy.polygon.technology/'],
  blockExplorerUrls: ['https://www.oklink.com/amoy'],
};

export async function switchNetwork(params: NetworkParams) {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: params.chainId }],
    });
    return true;
  } catch (e: any) {
    if (e.code !== 4902) {
      throw `unexpected error: ${e.code}`;
    }

    if (params.chainId == ETHEREUM_MAINNET_PARAMS.chainId) {
      throw `can't add Ethereum Mainnet`;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [params],
      });
    } catch (e: any) {
      console.log(e);
      throw `unexpected error: ${e.code}`;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: params.chainId }],
      });
      return true;
    } catch (e: any) {
      throw `unexpected error: ${e.code}`;
    }
  }
}

const normalizeBankAccount = (bankAccount: string): string =>
  bankAccount.toLowerCase().replace(/\s/g, '');

export const bankAccountIsSameAsOnRampBankAccount = (
  bankAccount: BankAccount,
  onRampInfo: GetAccountInfoResponse | null,
): boolean => {
  if (!onRampInfo || onRampInfo.result.case !== 'account') return false;

  const onRampBankInfo = onRampInfo.result.value.onrampBankAccount;
  const isIbanMatch =
    onRampBankInfo.case === 'onrampIban' &&
    bankAccount.case === 'iban' &&
    normalizeBankAccount(onRampBankInfo.value.iban) ===
      normalizeBankAccount(bankAccount.value.iban);

  const isScanMatch =
    onRampBankInfo.case === 'onrampScan' &&
    bankAccount.case === 'scan' &&
    normalizeBankAccount(onRampBankInfo.value.accountNumber) ===
      normalizeBankAccount(bankAccount.value.accountNumber) &&
    normalizeBankAccount(onRampBankInfo.value.sortCode) ===
      normalizeBankAccount(bankAccount.value.sortCode);

  return isIbanMatch || isScanMatch;
};
