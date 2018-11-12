import {
  FETCH_PHOTO,
  CLEAR_PHOTO,
  FETCH_POST,
  CLEAR_POST,
  INCREMENT_REQUEST_COUNTER,
  INCREMENT_RESPONSE_COUNTER,
  INCREMENT_ERROR_COUNTER,
} from './constants';

export const clearPhoto = () => ({ type: CLEAR_PHOTO });

export const fetchPhoto = id => ({
  type: FETCH_PHOTO,
  request: { url: `/photos/${id}` },
  meta: {
    abortOn: CLEAR_PHOTO,
  },
});

export const clearPost = () => ({ type: CLEAR_POST });
export const fetchPost = id => ({
  type: FETCH_POST,
  request: [{ url: `/posts/${id}` }, { url: `/posts/${id}/comments` }],
  meta: {
    abortOn: CLEAR_POST,
  },
});

export const incrementRequestCounter = () => ({
  type: INCREMENT_REQUEST_COUNTER,
});

export const incrementResponseCounter = () => ({
  type: INCREMENT_RESPONSE_COUNTER,
});

export const incrementErrorCounter = () => ({
  type: INCREMENT_ERROR_COUNTER,
});
