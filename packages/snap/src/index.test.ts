import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';

describe('onRpcRequest', () => {
  describe('handling errors', () => {
    it('throws an error if the origin is not allowed', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'sign_request',
        origin: 'https://example.com',
      });

      expect(response).toRespondWithError({
        code: -32603,
        message: 'Origin not allowed. Current origin hostname: example.com',
        stack: expect.any(String),
      });
    });

    it('throws an error if the requested method does not exist', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'foo',
        origin: 'https://snap.harborapp.link',
      });

      expect(response).toRespondWithError({
        code: -32603,
        message: 'Method not found.',
        stack: expect.any(String),
      });
    });

    it('fails if key returned from snap_getEntropy is invalid', async () => {
      const { request, mockJsonRpc } = await installSnap();
      const invalidPrivateKey = ['0x00'];
      mockJsonRpc({ method: 'snap_getEntropy', result: invalidPrivateKey });

      const origin = 'https://snap.harborapp.link';
      const response = await request({
        method: 'sign_request',
        origin,
        params: { message: 'Test message' },
      });
      expect(response).toRespondWithError({
        code: -32603,
        message: expect.stringMatching(/invalid private key/u),
        stack: expect.any(String),
      });
    });

    it('fails if params keys empty', async () => {
      const { request } = await installSnap();

      const origin = 'https://snap.harborapp.link';
      const response = await request({
        method: 'sign_request',
        origin,
      });
      expect(response).toRespondWithError({
        code: -32603,
        message: 'Params not found.',
        stack: expect.any(String),
      });
    });
  });

  it('correctly signs a message', async () => {
    const { request } = await installSnap();

    const origin = 'https://snap.harborapp.link';
    const { response } = await request({
      method: 'sign_request',
      origin,
      params: { message: 'Test message' },
    });

    expect(response).toHaveProperty('result');

    const typedResponse = response as {
      result: {
        signature: string;
        encoding: string;
        publicKey: string;
        signatureType: string;
      };
    };

    expect(typedResponse.result).not.toBeFalsy();
    expect(typedResponse.result.signature).toMatch(/^0x[a-fA-F0-9]*$/u);
    expect(typedResponse.result.encoding).toBe('hex');
    expect(typedResponse.result.publicKey).toMatch(/^0x[a-fA-F0-9]*$/u);
    expect(typedResponse.result.signatureType).toBe('keccak256/secp256k1');
  });
});
