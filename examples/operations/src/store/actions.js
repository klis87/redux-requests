import {
  FETCH_PHOTO,
  DELETE_PHOTO,
  FETCH_POSTS,
  DELETE_POST,
} from './constants';

export const fetchPhoto = id => ({
  type: FETCH_PHOTO,
  request: { url: `/photos/${id}` },
});

export const deletePhoto = id => ({
  type: DELETE_PHOTO,
  request: {
    url: `/photos/${id}`,
    method: 'delete',
  },
});

export const fetchPosts = () => ({
  type: FETCH_POSTS,
  request: { url: '/posts' },
});

export const deletePost = id => ({
  type: DELETE_POST,
  request: {
    url: `/posts/${id}`,
    method: 'delete',
  },
  meta: {
    id,
  },
});
