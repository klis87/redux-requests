import { createSuccessAction } from '../actions';
import defaultConfig from '../default-config';
import { createQuery } from '../requests-creators';

import ssrReducer from './ssr-reducer';

describe('reducers', () => {
  describe('ssrReducer', () => {
    it('returns empty array as default state', () => {
      expect(ssrReducer(undefined, {})).toEqual([]);
    });

    it('doesnt do anything if ssr option is falsy', () => {
      const state = [];
      expect(ssrReducer(state, {})).toBe(state);
    });

    it('appends request action type for success response when ssr option is server', () => {
      expect(
        ssrReducer(
          ['REQUEST'],
          createSuccessAction(createQuery('REQUEST', { url: '/' })(), 'data'),
          { ...defaultConfig, ssr: 'server' },
        ),
      ).toEqual(['REQUEST', 'REQUEST']);
    });

    it('removes request action type for matching request action with ssrResponse when ssr option is client', () => {
      expect(
        ssrReducer(
          ['REQUEST', 'REQUEST'],
          createQuery(
            'REQUEST',
            { url: '/' },
            { ssrResponse: { data: 'data' } },
          )(),
          { ...defaultConfig, ssr: 'client' },
        ),
      ).toEqual(['REQUEST']);
    });

    it('doesnt do anything for not matching request action with ssrResponse when ssr option is client', () => {
      expect(
        ssrReducer(
          ['REQUEST', 'REQUEST'],
          createQuery(
            'REQUEST2',
            { url: '/' },
            { ssrResponse: { data: 'data' } },
          )(),
          { ...defaultConfig, ssr: 'client' },
        ),
      ).toEqual(['REQUEST', 'REQUEST']);
    });
  });
});
