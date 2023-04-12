import { MutationResolvers } from '@graphql/types/generated-graphql-types';
import { createComment } from './create';
import { deleteComment } from './delete';
import { unhideComment, hideComment } from './display';
import { updateComment } from './update';

export const commentMutations: MutationResolvers = {
  createComment,
  updateComment,
  deleteComment,
  unhideComment,
  hideComment,
};
