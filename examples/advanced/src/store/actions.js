import {
  FETCH_PHOTO,
  FETCH_POST,
  INCREMENT_REQUEST_COUNTER,
  INCREMENT_RESPONSE_COUNTER,
  INCREMENT_ERROR_COUNTER,
} from './constants';

export const fetchPhoto = id => ({
  type: FETCH_PHOTO,
  request: { url: `/photos/${id}` },
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

export const incrementRequestCounter = () => ({
  type: INCREMENT_REQUEST_COUNTER,
});

export const incrementResponseCounter = () => ({
  type: INCREMENT_RESPONSE_COUNTER,
});

export const incrementErrorCounter = () => ({
  type: INCREMENT_ERROR_COUNTER,
});
