import { FETCH_PHOTO, FETCH_POST } from './constants';

export const fetchPhoto = id => ({
  type: FETCH_PHOTO,
  request:
    id === 1
      ? {
          response: {
            data: {
              albumId: 1,
              id: 1,
              title: 'accusamus beatae ad facilis cum similique qui sunt',
              url: 'https://via.placeholder.com/600/92c952',
              thumbnailUrl: 'https://via.placeholder.com/150/92c952',
            },
          },
        }
      : { error: { status: 404 } },
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
