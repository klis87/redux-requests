require('@babel/polyfill');
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const webpackConfig = require('./webpack.config');

const app = express();

app.use(
  webpackDevMiddleware(webpack(webpackConfig), {
    publicPath: '/',
  }),
);

const sleep = (timeout = 250) =>
  new Promise(resolve => setTimeout(resolve, timeout));

let books = [...Array(100)].map((_, i) => ({
  id: String(i + 1),
  title: `Title ${i + 1}`,
  rating: null,
}));

let posts = [...Array(6)].map((_, i) => ({
  id: String(i + 1),
  title: `Title ${i + 1}`,
  description: `lorem ipsum ${i + 1}`,
  likes: 0,
}));

const getGroup = ids =>
  ids.map(id => ({
    id: String(id),
    name: `Person ${id}`,
    followed: false,
  }));

let groups = [
  { name: 'A', people: getGroup([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) },
  { name: 'B', people: getGroup([1, 2, 4, 5, 6, 8, 9, 10, 11, 12]) },
  { name: 'C', people: getGroup([3, 4, 5, 8, 10, 11, 12, 13, 14, 15]) },
];

app.get('/books', async (req, res) => {
  const page = req.query.page || 1;
  await sleep();
  res.send(books.slice((page - 1) * 12, page * 12));
});

app.post('/books/:id/rating/:rating', async (req, res) => {
  if (req.query.token !== 'validToken') {
    res.status(401).send();
    return;
  }

  const { id, rating } = req.params;
  books = books.map(v => (v.id === id ? { ...v, rating: Number(rating) } : v));
  res.send(books.find(v => v.id === id));
});

app.get('/posts', async (req, res) => {
  await sleep();
  res.send(posts);
});

app.post('/posts/:id/like', async (req, res) => {
  const { id } = req.params;
  await sleep(2000);
  posts = posts.map(v => (v.id === id ? { ...v, likes: v.likes + 1 } : v));
  res.send(posts.find(v => v.id === id));
});

app.post('/posts/:id/unlike', async (req, res) => {
  const { id } = req.params;
  await sleep(2000);
  posts = posts.map(v => (v.id === id ? { ...v, likes: v.likes - 1 } : v));
  res.send(posts.find(v => v.id === id));
});

app.post('/posts/reorder', express.json(), async (req, res) => {
  await sleep();
  posts = req.body.ids.map(id => posts.find(v => v.id === id));
  res.send(posts);
});

app.get('/groups', async (req, res) => {
  await sleep();
  res.send(groups);
});

app.post('/groups/:id/follow', async (req, res) => {
  const { id } = req.params;
  groups = groups.map(group => ({
    ...group,
    people: group.people.map(v => (v.id === id ? { ...v, followed: true } : v)),
  }));
  res.send(
    groups
      .map(v => v.people)
      .flat()
      .find(v => v.id === id),
  );
});

app.post('/groups/:id/unfollow', async (req, res) => {
  const { id } = req.params;
  groups = groups.map(group => ({
    ...group,
    people: group.people.map(v =>
      v.id === id ? { ...v, followed: false } : v,
    ),
  }));
  res.send(
    groups
      .map(v => v.people)
      .flat()
      .find(v => v.id === id),
  );
});

app.listen(3000, () => {
  console.log('Listening on port 3000!');
});
