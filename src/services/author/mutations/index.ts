import { MutationResolvers } from '@graphql/types/generated-graphql-types';
import { createAuthor } from './createAuthor';
import { deleteAuthor } from './deleteAuthor';
import { updateAuthor } from './updateAuthor';

export const authorMutation: MutationResolvers = {
  createAuthor,
  updateAuthor,
  deleteAuthor,
};
