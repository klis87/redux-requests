require('@babel/polyfill');
const { createServer } = require('http');

const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const { ApolloServer, gql, PubSub } = require('apollo-server-express');

const webpackConfig = require('./webpack.config');

const pubsub = new PubSub();

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

let numberOfBookLikes = 0;

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
    numberOfBookLikes: Int!
  }

  type Mutation {
    deleteBook(id: ID!): Book
    likeBook(id: ID!): Book
    unlikeBook(id: ID!): Book
    singleUpload(file: Upload!): File!
    multipleUpload(files: [Upload!]!): [File!]!
  }

  type Subscription {
    onBookLiked: Int!
  }
`;

const findBookById = id => books.find(book => book.id === id);

const ON_BOOK_LIKED = 'ON_BOOK_LIKED';

const resolvers = {
  Query: {
    books: () => books,
    book: (_, args) => findBookById(args.id),
    numberOfBookLikes: () => numberOfBookLikes,
  },
  Subscription: {
    onBookLiked: {
      subscribe: () => pubsub.asyncIterator([ON_BOOK_LIKED]),
    },
  },
  Mutation: {
    deleteBook: (_, args) => findBookById(args.id),
    likeBook: (_, args) => {
      const book = findBookById(args.id);

      if (!book) {
        return null;
      }

      book.liked = true;
      numberOfBookLikes += 1;
      pubsub.publish(ON_BOOK_LIKED, { onBookLiked: numberOfBookLikes });
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

// const sleep = () => new Promise(resolve => setTimeout(resolve, 50));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  subscriptions: {
    // onConnect: async connectionParams => {
    //   if (connectionParams.token === 'pass') {
    //     await sleep();

    //     return {
    //       currentUser: 'user',
    //     };
    //   }

    //   throw new Error('Missing auth token!');
    // },
    keepAlive: 10000,
  },
});

server.applyMiddleware({ app, path: '/graphql' });

const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen(3000, () => {
  console.log('Listening on port 3000!');
});
