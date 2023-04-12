import { MutationResolvers } from '@graphql/types/generated-graphql-types';
import { createCategory } from './createCategory';
import { deleteCategory } from './deleteCategory';
import { updateCategory } from './updateCategory';

export const categoryMutation: MutationResolvers = {
  createCategory,
  updateCategory,
  deleteCategory,
};
