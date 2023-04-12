import { QueryResolvers } from '@graphql/types/generated-graphql-types';
import { getAllFeatures } from './getAllFeature';
import { getFeature } from './getFeature';

export const featureQueries: QueryResolvers = {
  getAllFeatures,
  getFeature,
};
