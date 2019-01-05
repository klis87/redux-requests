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
];

const typeDefs = gql`
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

const findBookById = id => books.find(book => book.id === id);

const resolvers = {
  Query: {
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
