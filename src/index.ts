require('module-alias/register');
import './alias-modules';
import schema from '@/graphql/schema';
import { ErrorCodes } from '@/graphql/types/generated-graphql-types';
import { GraphQLContext } from '@/graphql/types/graphql';
import AuthMiddleWare, { validateTokenForSubscription } from '@middleware/auth';
import { makeGraphqlError } from '@utils/error';
import { ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import { useServer } from 'graphql-ws/lib/use/ws';
import { createServer } from 'http';
import ws, { WebSocketServer } from 'ws';

import env from './env';
import { connect } from '@/database/mongodb';

connect(true).then(() => true);

const PORT = env.port ? parseInt(env.port) : 32001;

/**
 *
 * @param auth need to build graphql context
 */

const buildGraphqlContext = (auth: GraphQLContext['auth'], socketId: string = null) => {
  return {
    auth,
    socketId,
  };
};

const app = express();
app.use(cors());
app.use('/storage', express.static(__dirname + '/storage'));
app.use(graphqlUploadExpress({ maxFileSize: 50000000, maxFiles: 10 }));
app.use(bodyParser.json());
app.get('/', (_: express.Request, res: express.Response) => {
  return res.send('Hello book-shop Server!');
});
app.use(AuthMiddleWare.process);

// app.get('/graphql', (req, res) => {
//   res.sendFile(path.join(__dirname, '../graphiql-over-ws.html'));
// });
/**
 * create graphql server
 */
// apply app to apollo middleware
const httpServer = createServer(app);

const wsServer = new ws.Server({
  server: httpServer,
  path: '/graphql',
});

const serverCleanup = useServer(
  {
    schema,
    onConnect: async ({ connectionParams }: any) => {
      console.log('connected');

      try {
        if (connectionParams.authorization) {
          const auth: any = await validateTokenForSubscription(connectionParams.authorization);
          return buildGraphqlContext(auth);
        }
        throw makeGraphqlError('Missing auth id token!', ErrorCodes.Unauthenticated);
      } catch (error: any) {
        console.log('error', error);

        throw makeGraphqlError('Missing auth id token!', ErrorCodes.Unauthenticated);
      }
    },
    onDisconnect: async (webSocket, _context) => {
      console.log('Disconnected!');
    },
  },
  wsServer,
);

const server = new ApolloServer({
  context: ({ req, connection }: { req: express.Request & { auth: any }; connection: any }) => {
    if (connection) return connection.context;
    return buildGraphqlContext(req.auth);
  },
  formatError: (err) => {
    if (err && err.extensions && err.extensions.exception.code === 'ValidationError') {
      return makeGraphqlError(err.message, ErrorCodes.GraphqlValidationFailed);
    }
    return err;
  },

  schema,

  plugins: [
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
    ApolloServerPluginLandingPageGraphQLPlayground(),
    ApolloServerPluginDrainHttpServer({ httpServer }),
  ],
  introspection: true,
});

/**
 * func to start server
 */
const run = async () => {
  // await mongoose.connect(process.env.MONGODB_URL, {}).then(async () => {
  //   console.log(`🌧️  Mongodb connected 🌧️`);
  // });
  // server.installSubscriptionHandlers(httpServer);
  await server.start();
  server.applyMiddleware({ app, cors: true });
  httpServer.listen(PORT);
  return httpServer;
};

/**
 * server will be start if run without test mode
 */
if (process.env.NODE_ENV !== 'test') {
  run()
    .then(() => {
      console.log(`🍼  🚀  GraphQL server listen at: http://localhost:${PORT || 32001}/graphql`);
    })
    .catch((err) => {
      console.log(err);
    });
}

export { httpServer, run };
