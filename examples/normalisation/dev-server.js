require('@babel/polyfill');
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const { ApolloServer, gql } = require('apollo-server-express');

const webpackConfig = require('./webpack.config');

const app = express();

app.use(
  webpackDevMiddleware(webpack(webpackConfig), {
    publicPath: '/',
  }),
);

const books = [
  {
    id: 1,
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
    liked: false,
  },
  {
    id: 2,
    title: 'Jurassic Park',
    author: 'Michael Crichton',
    liked: true,
  },
];

[...Array(5)].forEach((_, i) => {
  books.push({
    id: String(i + 3),
    title: `Title ${i + 3}`,
    author: `Author ${i + 3}`,
    liked: false,
  });
});

const users = [
  {
    id: 'a',
    name: 'a',
    favouriteBook: books[1],
    likedBooks: books.slice(0, 10),
    bestFriend: {
      id: 'b',
      name: 'b',
      favouriteBook: books[11],
      likedBooks: books.slice(11, 20),
    },
  },
  {
    id: 'b',
    name: 'b',
    favouriteBook: books[11],
    likedBooks: books.slice(11, 20),
    bestFriend: {
      id: 'a',
      name: 'a',
      favouriteBook: books[1],
      likedBooks: books.slice(0, 10),
    },
  },
];

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    favouriteBook: Book!
    likedBooks: [Book!]!
    bestFriend: User!
  }

  type Book {
    id: ID!
    title: String!
    author: String!
    liked: Boolean!
  }

  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type Query {
    users: [User!]!
    books: [Book!]!
    book(id: ID!): Book
  }

  type Mutation {
    deleteBook(id: ID!): Book
    likeBook(id: ID!): Book
    unlikeBook(id: ID!): Book
    singleUpload(file: Upload!): File!
    multipleUpload(files: [Upload!]!): [File!]!
  }
`;

const findBookById = id => books.find(book => book.id == id);

const resolvers = {
  Query: {
    users: () => users,
    books: () => books,
    book: (_, args) => findBookById(args.id),
  },
  Mutation: {
    deleteBook: (_, args) => findBookById(args.id),
    likeBook: (_, args) => {
      const book = findBookById(args.id);

      if (!book) {
        return null;
      }

      book.liked = true;
      return book;
    },
    unlikeBook: (_, args) => {
      const book = findBookById(args.id);

      if (!book) {
        return null;
      }

      book.liked = false;
      return book;
    },
    singleUpload: (parent, args) => {
      return args.file.then(file => {
        return file;
      });
    },
    multipleUpload: (parent, args) => {
      return Promise.all(args.files).then(files => {
        return files;
      });
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.applyMiddleware({ app });

app.listen(3000, () => {
  console.log('Listening on port 3000!');
});
