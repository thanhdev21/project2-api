import { join, basename } from 'path';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { importSchema } from 'graphql-import';
import resolvers from '@/services';

const pathToSchema = join(__filename.replace(basename(__filename), ''), './schema.graphql');
const typeDefs = importSchema(pathToSchema);

const schema = makeExecutableSchema({
  typeDefs: typeDefs,
  resolvers: {
    ...resolvers,
  },
});

export default schema;
