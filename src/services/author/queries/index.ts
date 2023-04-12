import { QueryResolvers } from '@graphql/types/generated-graphql-types';
import { getAllAuthors } from './getAllAuthors';
import { getAuthor } from './getAuthor';

export const authorQuery: QueryResolvers = {
  getAllAuthors,
  getAuthor,
};
