import {
  ScanCoordinates,
  IbanCoordinates,
} from '../schema/gen/ramp/v1/public_pb';

/**
 * Hashing algorithm used for signing requests to Harbour API
 */
export enum HashingAlgorithm {
  Keccak256 = 'keccak256',
  SHA256 = 'sha256',
}

/**
 * Signing algorithm used for signing requests to Harbour API
 */
export enum SigningAlgorithm {
  SECP256K1 = 'secp256k1',
}

/**
 * Encoding algorithm used for signing requests to Harbour API
 */
export enum EncodingAlgorithm {
  Hex = 'hex',
  Base64 = 'secp256k1',
}

/**
 * Signature configuration for signing requests to Harbour API
 */
export interface SignatureConfig {
  hashingAlgorithm: HashingAlgorithm;
  signingAlgorithm: SigningAlgorithm;
  encodingAlgorithm: EncodingAlgorithm;
}

/**
 * Signature with metadata for particular request to Harbour API
 */
export interface Signature extends SignatureConfig {
  signature: string;
  publicKey: string;
}

/**
 * Signature function for signing requests to Harbour API. Accepts any data in string format and return signature
 * with metadata
 */
export type SignerFunction = (data: string) => Promise<Signature>;

/**
 * Signature configuration for Ethereum ecosystem
 */
export const EthereumSignature: SignatureConfig = {
  hashingAlgorithm: HashingAlgorithm.Keccak256,
  signingAlgorithm: SigningAlgorithm.SECP256K1,
  encodingAlgorithm: EncodingAlgorithm.Hex,
};

/**
 * Signature configuration for Cosmos ecosystem
 */
export const CosmosSignature: SignatureConfig = {
  hashingAlgorithm: HashingAlgorithm.SHA256,
  signingAlgorithm: SigningAlgorithm.SECP256K1,
  encodingAlgorithm: EncodingAlgorithm.Base64,
};

export type BankAccount =
  | {
      value: ScanCoordinates;
      case: 'scan';
    }
  | {
      value: IbanCoordinates;
      case: 'iban';
    };
