import { GraphQLError } from 'graphql';
import { ApolloError } from 'apollo-server-express';

export const makeGraphqlError = (messages: string, code) => {
  return new GraphQLError(messages, null, null, null, null, null, { code });
};

export class UserError extends ApolloError {
  constructor(message: string, code: string) {
    super(message, code);
    Object.defineProperty(this, 'name', { value: 'UserErrors' });
  }
}
