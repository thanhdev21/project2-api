import { QueryResolvers } from '@graphql/types/generated-graphql-types';
import { getAllUsers } from './getAllUser';
import { getUser } from './getUser';

export const userQueries: QueryResolvers = {
  getAllUsers,
  getUser,
};
