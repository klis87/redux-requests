import sinon from 'sinon';
import axios from 'axios';

import axiosDriver from './axios-driver';

describe('axiosDriver', () => {
  describe('getSuccessPayload', () => {
    it('returns response data', () => {
      const response = { data: 'data' };
      assert.deepEqual(axiosDriver.getSuccessPayload(response), response.data);
    });

    it('returns array of response data', () => {
      const responses = [{ data: 'data1' }, { data: 'data2' }];
      assert.deepEqual(axiosDriver.getSuccessPayload(responses), [
        responses[0].data,
        responses[1].data,
      ]);
    });
  });

  describe('getErrorPayload', () => {
    it('returns error', () => {
      const error = 'error';
      assert.equal(axiosDriver.getErrorPayload(error), error);
    });
  });

  describe('getRequestHandlers', () => {
    after(() => {
      axios.CancelToken.source.restore();
    });

    it('returns request handlers', () => {
      const tokenSource = {
        token: 'token',
        cancel: () => 'cancelled',
      };

      sinon.stub(axios.CancelToken, 'source').returns(tokenSource);
      const config = { myKey: 'myValue' };
      const requestInstance = requestConfig => requestConfig;
      const expected = {
        sendRequest: requestConfig =>
          requestInstance({ cancelToken: tokenSource.token, ...requestConfig }),
        abortRequest: tokenSource.cancel,
      };
      const result = axiosDriver.getRequestHandlers(requestInstance);
      assert.hasAllKeys(result, ['sendRequest', 'abortRequest']);
      assert.deepEqual(result.abortRequest, expected.abortRequest);
      assert.deepEqual(
        result.sendRequest(config),
        expected.sendRequest(config),
      );
    });
  });
});
