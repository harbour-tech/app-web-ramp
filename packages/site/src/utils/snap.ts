import type {MetaMaskInpageProvider} from '@metamask/providers';

import {defaultSnapOrigin} from '@/config';
import type {GetSnapsResponse, Snap} from '@/types';
import type {Hex} from '@metamask/utils';
import {assert, bytesToHex, stringToBytes} from "@metamask/utils";

/**
 * Get the installed snaps in MetaMask.
 *
 * @param provider - The MetaMask inpage provider.
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async (
  provider?: MetaMaskInpageProvider,
): Promise<GetSnapsResponse> =>
  (await (provider ?? window.ethereum).request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;
/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (
  snapId: string = defaultSnapOrigin,
  params: Record<'version' | string, unknown> = {},
) => {
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapId]: params,
    },
  });
};

/**
 * Get the snap from MetaMask.
 *
 * @param version - The version of the snap to install (optional).
 * @returns The snap object returned by the extension.
 */
export const getSnap = async (version?: string): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(
      (snap) =>
        snap.id === defaultSnapOrigin && (!version || snap.version === version),
    );
  } catch (error) {
    console.log('Failed to obtain installed snap', error);
    return undefined;
  }
};

/**
 * Invoke the "hello" method from the example snap.
 */
interface SingResponse {
  publicKey: string
  signature: string
  signatureType: string
  encoding: string
}
export const singRequest = async (body: string) => {
  return await window.ethereum.request<SingResponse>({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'sign_request',
        params: {
          message: body,
        }
      }
    },
  });
};

interface PersonalSingResponse {
  signature: string
}

export const requestPersonalSing = async (message: string, account: string): Promise<PersonalSingResponse> => {
  let challenge = bytesToHex(stringToBytes(message))
  let signature = await window.ethereum.request<Hex>({
    method: 'personal_sign',
    params: [challenge, account]
  });
  assert(signature, 'Ethereum provider did not return a signature.');
  return {
    signature: signature,
  }
};

interface RequestAccountsResponse {
  accounts: string[]
}

export const requestAccounts = async (): Promise<RequestAccountsResponse> => {
  try {
    await window.ethereum.request<string[]>({
      method: 'wallet_revokePermissions',
      params: [{
        "eth_accounts": {}
      }],
    });
  } catch (e) {
    console.log(e);
  }

  let accountsRes = await window.ethereum.request<string[]>({
      method: 'eth_requestAccounts',
      params: [],
    });
  let accounts = accountsRes!.map(a => a!)
  return {
    accounts: accounts!,
  }
};

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');
