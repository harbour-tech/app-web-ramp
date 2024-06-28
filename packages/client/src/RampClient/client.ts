import { PromiseClient } from '@connectrpc/connect';
import { RampService } from '../schema/gen/ramp/v1/public_connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { createPromiseClient } from '@bufbuild/connect';
import { SignerFunction } from './types';
import {
  EstimateOffRampFeeRequest,
  EstimateOffRampFeeResponse,
  EstimateOnRampFeeRequest,
  EstimateOnRampFeeResponse,
  GetAccountInfoRequest,
  GetAccountInfoResponse,
  RemoveAddressRequest,
  RemoveAddressResponse,
  SetBankAccountRequest,
  SetBankAccountResponse,
  WhitelistAddressRequest,
  WhitelistAddressResponse,
} from '../schema/gen/ramp/v1/public_pb';
import { PartialMessage } from '@bufbuild/protobuf';

export class RampClient {
  public client: PromiseClient<typeof RampService>;

  /**
   * Constructs instance of RampClient
   @param endpoint - URL of Harbour API
   @param signer - function which signs every request to Harbour API
   */
  constructor(endpoint: string, signer: SignerFunction) {
    const fetchWithSignature: typeof globalThis.fetch = async (r, init) => {
      if (!(init?.body instanceof Uint8Array)) {
        throw 'unsupported body type';
      }
      const bodyText = new TextDecoder().decode(init.body);
      const timestamp = Date.now().toString();
      const data = bodyText + timestamp;
      const signature = await signer(data);

      const headers = new Headers(init?.headers);
      headers.append('X-Signature', signature.signature);
      headers.append(
        'X-Signature-Type',
        `${signature.hashingAlgorithm}/${signature.signingAlgorithm}`,
      );
      headers.append('X-Signature-PublicKey', signature.publicKey);
      headers.append('X-Encoding', signature.encodingAlgorithm);
      headers.append('X-Signature-Timestamp', timestamp);

      const modifiedInit: RequestInit = { ...init, headers };
      return fetch(r, modifiedInit);
    };

    const transport = createConnectTransport({
      baseUrl: endpoint,
      fetch: fetchWithSignature,
    });
    this.client = createPromiseClient(RampService, transport);
  }

  /**
   * Returns account information. If result in the response is of type  authentication then user should be
   * authenticated (onboarded or logged in). Authentication URL is provided in the result.
   */
  public async getAccountInfo(
    request: PartialMessage<GetAccountInfoRequest>,
  ): Promise<GetAccountInfoResponse> {
    return this.client.getAccountInfo(request);
  }

  /**
   * Crypto assets can only be on-ramped to address which belongs to the user. In order to proof address belongs to the
   * user, address need to be signed with private key of this address.
   * @param request - whitelisting parameters
   */
  public async whitelistAddress(
    request: PartialMessage<WhitelistAddressRequest>,
  ): Promise<WhitelistAddressResponse> {
    return this.client.whitelistAddress(request);
  }

  /**
   * Removes whitelisted address
   * @param request - address removing parameters
   */
  public async removeAddress(
    request: RemoveAddressRequest,
  ): Promise<RemoveAddressResponse> {
    return this.client.removeAddress(request);
  }

  /**
   * Set bank account for off-ramping.
   * @param request - bank account parameters
   */
  public async setBankAccount(
    request: SetBankAccountRequest,
  ): Promise<SetBankAccountResponse> {
    return this.client.setBankAccount(request);
  }

  /**
   * Esestimate on ramp fee
   * @param request - on ramp parameters
   */
  public async estimateOnRampFee(
    request: EstimateOnRampFeeRequest,
  ): Promise<EstimateOnRampFeeResponse> {
    return this.client.estimateOnRampFee(request);
  }

  /**
   * Esestimate on ramp fee
   * @param request - on ramp parameters
   */
  public async estimateOffRampFee(
    request: EstimateOffRampFeeRequest,
  ): Promise<EstimateOffRampFeeResponse> {
    return this.client.estimateOffRampFee(request);
  }
}

export default RampClient;
