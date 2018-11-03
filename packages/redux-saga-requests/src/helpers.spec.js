import { mapRequest } from './helpers';

describe('helpers', () => {
  describe('mapRequest', () => {
    const addBody = request => ({ ...request, body: { x: 1 } });

    it('maps single request', () => {
      assert.deepEqual(mapRequest({ url: '/' }, addBody), {
        url: '/',
        body: { x: 1 },
      });
    });

    it('maps multiple requests', () => {
      assert.deepEqual(mapRequest([{ url: '/' }, { url: '/path' }], addBody), [
        {
          url: '/',
          body: { x: 1 },
        },
        {
          url: '/path',
          body: { x: 1 },
        },
      ]);
    });
  });
});
