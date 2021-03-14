import { createQuery } from './requests-creators';

describe('requestsCreators', () => {
  describe('createQuery', () => {
    it('adds toString method', () => {
      const queryCreator = createQuery('QUERY', () => ({ url: '/' }));
      expect(queryCreator.toString()).toBe('QUERY');
    });

    it('can create queries with only request config', () => {
      const queryCreator = createQuery('QUERY', { url: '/' });
      expect(queryCreator()).toEqual({
        type: 'QUERY',
        payload: { url: '/' },
        meta: { requestType: 'QUERY' },
      });
    });

    it('merges meta properly', () => {
      const queryCreator = createQuery(
        'QUERY',
        { url: '/' },
        { normalize: true },
      );
      expect(queryCreator()).toEqual({
        type: 'QUERY',
        payload: { url: '/' },
        meta: { requestType: 'QUERY', normalize: true },
      });
    });

    it('allows callbacks configs', () => {
      const queryCreator = createQuery(
        'QUERY',
        id => ({ url: `/${id}` }),
        id => ({ requestKey: id }),
      );
      expect(queryCreator('1')).toEqual({
        type: 'QUERY',
        payload: { url: '/1' },
        meta: { requestType: 'QUERY', requestKey: '1' },
      });
    });
  });
});
