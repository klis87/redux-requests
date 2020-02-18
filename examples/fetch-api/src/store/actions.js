import { FETCH_PHOTO, CLEAR_PHOTO, FETCH_POST, CLEAR_POST } from './constants';

export const clearPhoto = () => ({
  type: CLEAR_PHOTO,
  meta: { mutations: { FETCH_PHOTO: { updateData: () => null, local: true } } },
});

export const fetchPhoto = id => ({
  type: FETCH_PHOTO,
  request: { url: `/photos/${id}` },
  meta: {
    abortOn: CLEAR_PHOTO,
  },
});

export const clearPost = () => ({
  type: CLEAR_POST,
  meta: { mutations: { FETCH_POST: { updateData: () => null, local: true } } },
});

export const fetchPost = id => ({
  type: FETCH_POST,
  request: [{ url: `/posts/${id}` }, { url: `/posts/${id}/comments` }],
  meta: {
    abortOn: CLEAR_POST,
    getData: data => ({
      ...data[0],
      comments: data[1],
    }),
  },
});
