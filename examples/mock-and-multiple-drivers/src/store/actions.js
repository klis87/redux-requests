import { FETCH_PHOTO, FETCH_POST } from './constants';

export const fetchPhoto = id => ({
  type: FETCH_PHOTO,
  request: { url: `/photos/${id}` },
  meta: { driver: 'mock' },
});

export const fetchPost = id => ({
  type: FETCH_POST,
  request: [{ url: `/posts/${id}` }, { url: `/posts/${id}/comments` }],
  meta: {
    getData: data => ({
      ...data[0],
      comments: data[1],
    }),
  },
});
