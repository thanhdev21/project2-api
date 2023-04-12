import { QueryResolvers } from '@graphql/types/generated-graphql-types';
import { getAllCategories } from './getAllCategory';
import { getCategory } from './getCategory';

export const categoryQuery: QueryResolvers = {
  getAllCategories,
  getCategory,
};
