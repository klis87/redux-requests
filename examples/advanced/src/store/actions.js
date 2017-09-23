import { FETCH_PHOTO, CLEAR_PHOTO, FETCH_POST, CLEAR_POST, CANCEL_FETCH_POST } from './constants';

export const fetchPhoto = id => ({
  type: FETCH_PHOTO,
  request: { url: `/photos/${id}` },
});

export const clearPhoto = () => ({ type: CLEAR_PHOTO });

export const fetchPost = id => ({
  type: FETCH_POST,
  requests: [
    { url: `/posts/${id}` },
    { url: `/posts/${id}/comments` },
  ],
});

export const clearPost = () => ({ type: CLEAR_POST });
export const cancelFetchPost = () => ({ type: CANCEL_FETCH_POST });
