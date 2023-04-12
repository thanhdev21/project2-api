import { QueryResolvers } from '@graphql/types/generated-graphql-types';
import { getMe } from './me';

export const authQuery: QueryResolvers = {
  me: getMe,
};
