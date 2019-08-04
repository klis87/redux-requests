import { FETCH_PHOTO, CLEAR_PHOTO, FETCH_POST, CLEAR_POST } from './constants';

export const clearPhoto = () => ({ type: CLEAR_PHOTO });

export const fetchPhoto = id => ({
  type: FETCH_PHOTO,
  request: { url: `/photos/${id}` },
  meta: { driver: 'mock', abortOn: CLEAR_PHOTO, resetOn: [CLEAR_PHOTO] },
});

export const clearPost = () => ({ type: CLEAR_POST });

export const fetchPost = id => ({
  type: FETCH_POST,
  request: [{ url: `/posts/${id}` }, { url: `/posts/${id}/comments` }],
  meta: {
    abortOn: CLEAR_POST,
    getData: (state, action) => ({
      ...action.data[0],
      comments: action.data[1],
    }),
    resetOn: [CLEAR_POST],
  },
});
