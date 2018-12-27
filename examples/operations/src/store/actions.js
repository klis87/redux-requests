import {
  FETCH_PHOTO,
  DELETE_PHOTO,
  DELETE_PHOTO_OPTIMISTIC,
  FETCH_POSTS,
  DELETE_POST,
  DELETE_POST_OPTIMISTIC,
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

export const deletePhotoOptimistic = photo => ({
  type: DELETE_PHOTO_OPTIMISTIC,
  request: {
    url: `/photos/${photo.id}`,
    method: 'delete',
  },
  meta: {
    deletedPhoto: photo,
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

export const deletePostOptimistic = post => ({
  type: DELETE_POST_OPTIMISTIC,
  request: {
    url: `/posts/${post.ids}`,
    method: 'delete',
  },
  meta: {
    deletedPost: post,
  },
});
