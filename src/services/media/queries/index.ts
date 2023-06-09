import { QueryResolvers } from '@graphql/types/generated-graphql-types';
import { getAllMedia } from './getAllMedia';
import { getMedia } from './getMedia';

export const mediaQuery: QueryResolvers = {
  getAllMedia,
  getMedia,
};
