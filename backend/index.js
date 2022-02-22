const { execute, subscribe } = require("graphql");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { ApolloServer, gql } = require("apollo-server-express");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const { PubSub } = require("graphql-subscriptions");
const express = require("express");
const createServer = require("http").createServer;

const pubsub = new PubSub();

let books = [];

const typeDefs = gql`
  type Book {
    title: String
    author: String
    text: String
  }
  input BookInput {
    title: String
    author: String
    text: String
  }
  type Query {
    books: [Book]
  }
  type Mutation {
    addBook(book: BookInput!): Book
  }
  type Subscription {
    bookAdded: Book
  }
`;

const BOOK_ADDED = "BOOK_ADDED";

const resolvers = {
  Query: {
    books: () => books,
  },
  Mutation: {
    addBook: (_, args) => {
      const { book } = args;
      pubsub.publish(BOOK_ADDED, {
        bookAdded: book,
      });
      books.push(book);
      return book;
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(BOOK_ADDED),
    },
  },
};

async function startApolloServer(typeDefs, resolvers) {
  const app = express();
  const httpServer = createServer(app);
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const subscriptionServer = SubscriptionServer.create(
    {
      // This is the `schema` we just created.
      schema,
      // These are imported from `graphql`.
      execute,
      subscribe,
    },
    {
      // This is the `httpServer` we created in a previous step.
      server: httpServer,
      // Pass a different path here if your ApolloServer serves at
      // a different path.
      path: "/graphql",
    }
  );
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
  });
  await server.start();
  server.applyMiddleware({ app });
  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}

startApolloServer(typeDefs, resolvers);
