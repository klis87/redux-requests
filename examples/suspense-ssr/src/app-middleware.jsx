import express from 'express';
import React from 'react';
import { RequestsProvider } from '@redux-requests/react';
import { createDriver } from '@redux-requests/axios';
import { renderToStringAsync } from 'react-async-ssr';
import axios from 'axios';

import App from './components/app';

const router = express.Router();

const books = [
  {
    id: '1',
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
    liked: false,
  },
  {
    id: '2',
    title: 'Jurassic Park',
    author: 'Michael Crichton',
    liked: true,
  },
  {
    id: '3',
    title: 'Jurassic Park 2',
    author: 'Michael Crichton',
    liked: true,
  },
  {
    id: '4',
    title: 'Jurassic Park 3',
    author: 'Michael Crichton',
    liked: true,
  },
];

const bookScreeningActors = [
  {
    id: '1',
    bookId: '1',
    bookTitle: 'Harry Potter and the Chamber of Secrets',
    name: 'Daniel Radcliffe',
  },

  {
    id: '2',
    bookId: '2',
    bookTitle: 'Jurassic Park',
    name: 'Sam Neill',
  },
];

const sleep = () => new Promise(resolve => setTimeout(resolve, 500));

router.get('/api/books', async (req, res) => {
  await sleep();
  res.send(JSON.stringify(books));
});

router.get('/api/books/:id', async (req, res) => {
  const { id } = req.params;

  if (!id || !books.find(v => v.id === id)) {
    res.sendStatus(404).send();
    return;
  }

  await sleep();
  res.send(JSON.stringify(books.find(v => v.id === id)));
});

router.get('/api/bookScreeningActors', async (req, res) => {
  const { bookIds } = req.query;

  if (!bookIds || !Array.isArray(bookIds)) {
    res.status(400).send('wrong args');
    return;
  }

  await sleep();
  res.send(
    JSON.stringify(bookScreeningActors.filter(v => bookIds.includes(v.bookId))),
  );
});

router.get('/favicon.ico', (req, res) => {
  res.status(404).send();
});

router.use(async (req, res) => {
  let store;

  const html = await renderToStringAsync(
    <RequestsProvider
      requestsConfig={{
        driver: createDriver(
          axios.create({
            baseURL: 'http://localhost:3000',
          }),
        ),
        ssr: 'server',
        disableRequestsPromise: true,
      }}
      getStore={requestsStore => {
        store = requestsStore;
      }}
      suspenseSsr
      autoLoad
    >
      <App />
    </RequestsProvider>,
  );

  res.render('index', {
    html,
    initialState: JSON.stringify(store.getState()),
    layout: false,
  });
});

export default () => router;
