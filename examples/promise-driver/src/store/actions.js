import axios from 'axios';
import { FETCH_PHOTO, FETCH_POST } from './constants';

export const fetchPhoto = id => ({
  type: FETCH_PHOTO,
  request: {
    promise: axios.get(`https://jsonplaceholder.typicode.com/photos/${id}`),
  },
});

export const fetchPost = id => ({
  type: FETCH_POST,
  request: [
    {
      promise: axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`),
    },
    {
      promise: axios.get(
        `https://jsonplaceholder.typicode.com/posts/${id}/comments`,
      ),
    },
  ],
  meta: {
    getData: data => ({
      ...data[0],
      comments: data[1],
    }),
  },
});
