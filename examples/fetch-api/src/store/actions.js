import { FETCH_POSTS, CLEAR_POSTS } from './constants';

export const fetchPosts = () => ({
  type: FETCH_POSTS,
  request: { url: 'https://jsonplaceholder.typicode.com/posts' },
});

export const fetchPostWhichDoesntExist = () => ({
  type: FETCH_POSTS,
  request: { url: 'https://jsonplaceholder.typicode.com/posts/1111' },
});

export const clearPosts = () => ({ type: CLEAR_POSTS });
