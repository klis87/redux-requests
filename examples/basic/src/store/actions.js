import { FETCH_POSTS, CLEAR_POSTS } from './constants';

export const fetchPosts = () => ({
  type: FETCH_POSTS,
  request: { url: '/posts' },
});

export const fetchPostsWithMicroTimeout = () => ({
  type: FETCH_POSTS,
  request: { url: '/posts', timeout: 1 },
});

export const clearPosts = () => ({ type: CLEAR_POSTS });
