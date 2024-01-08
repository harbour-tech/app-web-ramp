import type {OnRpcRequestHandler} from '@metamask/snaps-sdk';
import {keccak256, toUtf8Bytes, Wallet} from 'ethers';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  switch (request.method) {
    case 'sign_request':
      const privateKey = await snap.request({
        method: 'snap_getEntropy',
        params: {
          version: 1,
          salt: 'harbour-ramp',
        },
      });
      const wallet = new Wallet(privateKey);
      const params = request.params as SignMessageParams;
      const signature = wallet.signingKey.sign(keccak256(toUtf8Bytes(params.message))).serialized

      return {
        publicKey: wallet.signingKey.publicKey,
        signature: signature,
        signatureType: "keccak256/secp256k1",
        encoding: "hex",
      }
    default:
      throw new Error('Method not found.');
  }
};

/**
 * The parameters for the `signMessage` JSON-RPC method.
 */
export type SignMessageParams = {
  /**
   * The message to sign. It will be signed using the snap's signing key,
   * derived with the [`snap_getEntropy`](https://docs.metamask.io/snaps/reference/rpc-api/#snap_getentropy)
   * method.
   */
  message: string;
};
