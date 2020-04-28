import { mapRequest } from './helpers';

describe('helpers', () => {
  describe('mapRequest', () => {
    const addBody = request => ({ ...request, body: { x: 1 } });

    it('maps single request', () => {
      expect(mapRequest({ url: '/' }, addBody)).toEqual({
        url: '/',
        body: { x: 1 },
      });
    });

    it('maps multiple requests', () => {
      expect(mapRequest([{ url: '/' }, { url: '/path' }], addBody)).toEqual([
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
