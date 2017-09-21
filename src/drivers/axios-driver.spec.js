import sinon from 'sinon';
import axios from 'axios';
import { call } from 'redux-saga/effects';

import axiosDriver from './axios-driver';

describe('axios driver', () => {
  describe('getSuccessPayload', () => {
    it('returns response data', () => {
      const response = { data: 'data' };
      assert.deepEqual(axiosDriver.getSuccessPayload(response), response.data);
    });

    it('returns array of response data', () => {
      const responses = [{ data: 'data1' }, { data: 'data2' }];
      assert.deepEqual(axiosDriver.getSuccessPayload(responses), [responses[0].data, responses[1].data]);
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
        cancel: () => {},
      };

      sinon.stub(axios.CancelToken, 'source').returns(tokenSource);
      const config = { myKey: 'myValue' };
      const requestInstance = () => {};
      const expected = {
        sendRequest: requestConfig => call(requestInstance, { cancelToken: tokenSource.token, ...requestConfig }),
        abortRequest: call([tokenSource, 'cancel']),
      };
      const result = axiosDriver.getRequestHandlers(requestInstance);
      assert.hasAllKeys(result, ['sendRequest', 'abortRequest']);
      assert.deepEqual(result.abortRequest, expected.abortRequest);
      assert.deepEqual(result.sendRequest(config), expected.sendRequest(config));
    });
  });
});
