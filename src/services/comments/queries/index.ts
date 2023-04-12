import { QueryResolvers } from '@graphql/types/generated-graphql-types';
import { getComment } from './comment';
import { getChildComments, getComments } from './comments';

export const commentQueries: QueryResolvers = {
  getComments,
  getChildComments,
  getComment,
};
